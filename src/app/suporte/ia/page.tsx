"use client";

import { FormEvent, useState } from "react";
import AppShell from "@/components/AppShell";

interface ChatItem {
  id: string;
  question: string;
  answer: string;
  sources: Array<{ id: string; title: string }>;
}

interface ApiResponse<T> { ok: boolean; data?: T; error?: string; }

export default function SupportIaPage() {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const question = String(form.get("question") || "");
    const response = await fetch("/api/support/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const payload = (await response.json()) as ApiResponse<{
      answer: string;
      usedSources: Array<{ id: string; title: string }>;
      configured: boolean;
    }>;

    setLoading(false);

    if (!response.ok || !payload.ok || !payload.data) {
      setError(payload.error || "Não foi possível consultar a IA.");
      return;
    }

    setItems((current) => [
      {
        id: crypto.randomUUID(),
        question,
        answer: payload.data?.answer || "",
        sources: payload.data?.usedSources || [],
      },
      ...current,
    ]);
    event.currentTarget.reset();
  }

  return (
    <AppShell>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">IA de suporte</p>
        <h1 className="font-sora text-3xl font-bold">Tire dúvidas sobre o SelectSaaS</h1>
        <p className="mt-2 max-w-3xl text-on-surface-variant">
          A IA usa a base de conhecimento cadastrada pelo administrador e responde apenas no contexto de suporte da plataforma.
        </p>
      </div>

      {error && <div className="mb-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</div>}

      <section className="rounded-2xl border border-surface-high bg-surface-low p-6">
        <form className="space-y-4" onSubmit={ask}>
          <label className="block text-sm font-medium text-on-surface-variant">
            Pergunta *
            <textarea
              className="mt-1.5 min-h-32 w-full resize-none rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
              name="question"
              required
              minLength={5}
              placeholder="Ex.: Como acompanho meu ticket? Como solicito uma demonstração?"
            />
          </label>
          <button
            className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Consultando IA..." : "Perguntar"}
          </button>
        </form>
      </section>

      <section className="mt-8 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-surface-high bg-surface-low p-6 text-sm text-on-surface-variant">
            Nenhuma pergunta feita nesta sessão.
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-surface-high bg-surface-low p-6">
              <p className="mb-3 text-sm font-semibold text-primary">Pergunta</p>
              <p className="whitespace-pre-wrap text-on-surface">{item.question}</p>
              <p className="mb-3 mt-6 text-sm font-semibold text-secondary">Resposta</p>
              <p className="whitespace-pre-wrap leading-relaxed text-on-surface-variant">{item.answer}</p>
              {item.sources.length > 0 && (
                <div className="mt-5 rounded-xl border border-surface-high bg-background p-4 text-xs text-on-surface-variant">
                  <strong className="text-on-surface">Fontes internas usadas:</strong>{" "}
                  {item.sources.map((source) => source.title).join(", ")}
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </AppShell>
  );
}
