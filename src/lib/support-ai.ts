interface KnowledgeSource {
  id: string;
  title: string;
  content: string;
  category: string | null;
}

interface GenerateSupportAnswerInput {
  question: string;
  sources: KnowledgeSource[];
}

export const SUPPORT_AI_SYSTEM_PROMPT = `Você é a IA de suporte do SelectSaaS.
Responda sempre em português do Brasil, com clareza, objetividade e foco em suporte da plataforma.
Use o contexto interno fornecido quando existir.
Não exponha chaves, detalhes internos de infraestrutura, strings de conexão ou dados sensíveis.
Quando não houver base suficiente, oriente o usuário a abrir um ticket de suporte dentro do SelectSaaS.`;

function buildContext(sources: KnowledgeSource[]) {
  if (!sources.length) {
    return "Nenhum artigo interno relevante foi encontrado para esta pergunta.";
  }

  return sources
    .map((source, index) => `Fonte ${index + 1}: ${source.title}\nCategoria: ${source.category || "Geral"}\nConteúdo: ${source.content.slice(0, 1800)}`)
    .join("\n\n---\n\n");
}

function getProviderConfig() {
  const explicitProvider = process.env.AI_PROVIDER?.toLowerCase();

  if (explicitProvider === "openai") {
    return {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini",
    };
  }

  return {
    provider: "deepseek",
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseUrl: process.env.DEEPSEEK_API_BASE_URL || "https://api.deepseek.com",
    model: process.env.DEEPSEEK_MODEL || process.env.AI_MODEL || "deepseek-chat",
  };
}

export async function generateSupportAnswer({ question, sources }: GenerateSupportAnswerInput) {
  const config = getProviderConfig();

  if (!config.apiKey) {
    return {
      answer:
        "A IA de suporte ainda não foi configurada no servidor. Configure a chave do provedor de IA nas variáveis de ambiente ou abra um ticket para atendimento humano.",
      provider: config.provider,
      model: config.model,
      usedSources: sources.map((source) => ({ id: source.id, title: source.title })),
      configured: false,
    };
  }

  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      max_tokens: 1200,
      messages: [
        { role: "system", content: SUPPORT_AI_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Contexto interno:\n${buildContext(sources)}\n\nPergunta do usuário:\n${question}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Falha ao consultar a IA (${response.status}). ${detail.slice(0, 300)}`);
  }

  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const answer = payload.choices?.[0]?.message?.content?.trim();

  return {
    answer: answer || "Não foi possível gerar uma resposta para esta pergunta.",
    provider: config.provider,
    model: config.model,
    usedSources: sources.map((source) => ({ id: source.id, title: source.title })),
    configured: true,
  };
}
