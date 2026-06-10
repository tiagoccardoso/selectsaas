"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { StatusBadge, formatDate } from "@/components/StatusBadge";

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages_count: number;
}

interface ApiResponse<T> { ok: boolean; data?: T; error?: string; }

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTickets() {
    setLoading(true);
    const response = await fetch("/api/support/tickets", { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<{ tickets: Ticket[] }>;
    setLoading(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error || "Não foi possível carregar os tickets.");
      return;
    }

    setTickets(payload.data?.tickets || []);
  }

  useEffect(() => {
    loadTickets().catch(() => {
      setLoading(false);
      setError("Não foi possível carregar os tickets.");
    });
  }, []);

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const payload = (await response.json()) as ApiResponse<{ id: string }>;

    setSaving(false);

    if (!response.ok || !payload.ok || !payload.data?.id) {
      setError(payload.error || "Não foi possível criar o ticket.");
      return;
    }

    window.location.href = `/suporte/tickets/${payload.data.id}`;
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">Central de suporte</p>
          <h1 className="font-sora text-3xl font-bold">Meus tickets</h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            Abra chamados, acompanhe respostas e mantenha o histórico de atendimento organizado em um só lugar.
          </p>
        </div>
        <Link
          href="/suporte/ia"
          className="rounded-lg border border-primary/40 px-4 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/10"
        >
          Tirar dúvida com IA
        </Link>
      </div>

      {error && <div className="mb-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</div>}

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-surface-high bg-surface-low p-6">
          <h2 className="font-sora text-xl font-semibold">Abrir novo ticket</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Descreva sua dúvida ou problema com o máximo de detalhes possível.
          </p>

          <form className="mt-6 space-y-4" onSubmit={createTicket}>
            <label className="block text-sm font-medium text-on-surface-variant">
              Título *
              <input
                className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                name="title"
                required
                minLength={4}
                placeholder="Ex.: Não consigo acessar minha conta"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-on-surface-variant">
                Categoria
                <input
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="category"
                  placeholder="Acesso, cobrança, implantação..."
                />
              </label>

              <label className="block text-sm font-medium text-on-surface-variant">
                Prioridade
                <select
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="priority"
                  defaultValue="medium"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-on-surface-variant">
              Descrição *
              <textarea
                className="mt-1.5 min-h-36 w-full resize-none rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                name="description"
                required
                minLength={10}
                placeholder="Explique o que aconteceu, qual tela estava usando e o resultado esperado."
              />
            </label>

            <button
              className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              {saving ? "Criando ticket..." : "Criar ticket"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-surface-high bg-surface-low p-6">
          <h2 className="font-sora text-xl font-semibold">Histórico</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Usuários padrão visualizam somente os próprios tickets.</p>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="rounded-xl border border-surface-high bg-background p-4 text-sm text-on-surface-variant">Carregando tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="rounded-xl border border-surface-high bg-background p-4 text-sm text-on-surface-variant">Nenhum ticket criado até o momento.</p>
            ) : (
              tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/suporte/tickets/${ticket.id}`}
                  className="block rounded-xl border border-surface-high bg-background p-4 transition hover:border-primary/40"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-sora font-semibold text-on-surface">{ticket.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{ticket.description}</p>
                    </div>
                    <StatusBadge value={ticket.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                    <StatusBadge value={ticket.priority} type="priority" />
                    <span className="rounded-full bg-surface-high px-2.5 py-1">{ticket.category}</span>
                    <span className="rounded-full bg-surface-high px-2.5 py-1">{ticket.messages_count} mensagem(ns)</span>
                    <span className="rounded-full bg-surface-high px-2.5 py-1">Atualizado em {formatDate(ticket.updated_at)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
