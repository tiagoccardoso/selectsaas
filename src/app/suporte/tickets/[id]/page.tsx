"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  closed_at: string | null;
  user_name: string;
  user_email: string;
}

interface Message {
  id: string;
  author_type: string;
  author_name: string | null;
  message: string;
  created_at: string;
}

interface ApiResponse<T> { ok: boolean; data?: T; error?: string; }

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTicket() {
    const response = await fetch(`/api/support/tickets/${params.id}`, { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<{ ticket: Ticket; messages: Message[] }>;

    if (!response.ok || !payload.ok || !payload.data) {
      setError(payload.error || "Não foi possível carregar o ticket.");
      setLoading(false);
      return;
    }

    setTicket(payload.data.ticket);
    setMessages(payload.data.messages);
    setLoading(false);
  }

  useEffect(() => {
    loadTicket().catch(() => {
      setError("Não foi possível carregar o ticket.");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/support/tickets/${params.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const payload = (await response.json()) as ApiResponse<{ created: boolean }>;

    setSaving(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error || "Não foi possível enviar a mensagem.");
      return;
    }

    event.currentTarget.reset();
    await loadTicket();
  }

  async function closeTicket() {
    setSaving(true);
    const response = await fetch(`/api/support/tickets/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved", priority: ticket?.priority || "medium" }),
    });
    const payload = (await response.json()) as ApiResponse<{ updated: boolean }>;
    setSaving(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error || "Não foi possível atualizar o ticket.");
      return;
    }

    await loadTicket();
  }

  return (
    <AppShell>
      <Link href="/suporte" className="mb-6 inline-flex text-sm text-on-surface-variant transition hover:text-primary">
        ← Voltar aos tickets
      </Link>

      {error && <div className="mb-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-surface-high bg-surface-low p-8 text-on-surface-variant">Carregando ticket...</div>
      ) : !ticket ? (
        <div className="rounded-2xl border border-surface-high bg-surface-low p-8 text-on-surface-variant">Ticket não encontrado.</div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="rounded-2xl border border-surface-high bg-surface-low p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">Ticket</p>
                <h1 className="font-sora text-3xl font-bold">{ticket.title}</h1>
                <p className="mt-2 text-sm text-on-surface-variant">Aberto por {ticket.user_name} em {formatDate(ticket.created_at)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={ticket.status} />
                <StatusBadge value={ticket.priority} type="priority" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`rounded-xl border p-4 ${
                    message.author_type === "admin"
                      ? "border-secondary/30 bg-secondary/10"
                      : "border-surface-high bg-background"
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
                    <span className="font-semibold text-on-surface">
                      {message.author_type === "admin" ? "Equipe SelectSaaS" : message.author_name || "Usuário"}
                    </span>
                    <span>{formatDate(message.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">{message.message}</p>
                </article>
              ))}
            </div>

            <form className="mt-8 space-y-4" onSubmit={sendMessage}>
              <label className="block text-sm font-medium text-on-surface-variant">
                Responder ticket
                <textarea
                  className="mt-1.5 min-h-28 w-full resize-none rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="message"
                  required
                  placeholder="Digite sua resposta..."
                />
              </label>
              <button
                className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                type="submit"
              >
                {saving ? "Enviando..." : "Enviar resposta"}
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-surface-high bg-surface-low p-6">
              <h2 className="font-sora text-lg font-semibold">Detalhes</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-on-surface-variant">Categoria</dt>
                  <dd className="font-semibold">{ticket.category}</dd>
                </div>
                <div>
                  <dt className="text-on-surface-variant">Atualizado</dt>
                  <dd className="font-semibold">{formatDate(ticket.updated_at)}</dd>
                </div>
                <div>
                  <dt className="text-on-surface-variant">E-mail</dt>
                  <dd className="break-all font-semibold">{ticket.user_email}</dd>
                </div>
              </dl>
              {!["resolved", "closed"].includes(ticket.status) && (
                <button
                  className="mt-6 w-full rounded-lg border border-primary/40 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-60"
                  disabled={saving}
                  onClick={closeTicket}
                  type="button"
                >
                  Marcar como resolvido
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
