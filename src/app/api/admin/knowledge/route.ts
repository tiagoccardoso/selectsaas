import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { jsonOk, toErrorResponse } from "@/lib/api-response";
import { cleanText, pickEnum, requireText } from "@/lib/validators";

const statuses = ["draft", "active", "archived"] as const;

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);

    const articles = await sql`
      SELECT id, title, content, category, status, created_at, updated_at
      FROM support_knowledge_articles
      ORDER BY updated_at DESC
      LIMIT 200
    `;

    return jsonOk({ articles });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminUser(request);
    const body = await request.json();
    const title = requireText(body.title, "Título", 4, 180);
    const content = requireText(body.content, "Conteúdo", 20, 20000);
    const category = cleanText(body.category, 100) || "Geral";
    const status = pickEnum(body.status, statuses, "active");

    const rows = await sql<{ id: string }[]>`
      INSERT INTO support_knowledge_articles (title, content, category, status, created_by)
      VALUES (${title}, ${content}, ${category}, ${status}::knowledge_status, ${user.id}::uuid)
      RETURNING id
    `;

    return jsonOk({ id: rows[0].id }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
