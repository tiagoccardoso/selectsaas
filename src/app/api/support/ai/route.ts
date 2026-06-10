import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireRequestUser } from "@/lib/auth";
import { jsonOk, toErrorResponse } from "@/lib/api-response";
import { requireText } from "@/lib/validators";
import { generateSupportAnswer } from "@/lib/support-ai";

interface KnowledgeRow {
  id: string;
  title: string;
  content: string;
  category: string | null;
}

function normalizeForSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function getSearchTerms(question: string) {
  return normalizeForSearch(question)
    .split(/\s+/)
    .filter((term) => term.length >= 4)
    .slice(0, 8);
}

function rankSources(sources: KnowledgeRow[], question: string) {
  const terms = getSearchTerms(question);

  if (!terms.length) {
    return sources.slice(0, 3);
  }

  const ranked = sources
    .map((source) => {
      const haystack = normalizeForSearch(`${source.title} ${source.category || ""} ${source.content}`);
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { source, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.source);

  return (ranked.length ? ranked : sources).slice(0, 5);
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const body = await request.json();
    const question = requireText(body.question, "Pergunta", 5, 2000);

    const availableSources = await sql<KnowledgeRow[]>`
      SELECT id, title, content, category
      FROM support_knowledge_articles
      WHERE status = 'active'
      ORDER BY updated_at DESC
      LIMIT 50
    `;
    const sources = rankSources(availableSources, question);

    const result = await generateSupportAnswer({ question, sources });

    await sql`
      INSERT INTO support_ai_conversations (user_id, question, answer, safe_metadata)
      VALUES (
        ${user.id}::uuid,
        ${question},
        ${result.answer},
        ${JSON.stringify({ provider: result.provider, model: result.model, configured: result.configured, usedSources: result.usedSources })}::jsonb
      )
    `;

    return jsonOk({ ...result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
