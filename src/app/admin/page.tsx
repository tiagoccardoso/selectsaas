"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { StatusBadge, formatDate } from "@/components/StatusBadge";

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  system_id: string | null;
  system_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  messages_count: number;
  attachments_count: number;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  product_slug: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  is_active: boolean;
  created_at: string;
  tickets_count: number;
}


interface SupportSystem {
  id: string;
  name: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  tickets_count: number;
}

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  status: "draft" | "active" | "archived";
  updated_at: string;
}

interface CustomSaasRequest {
  id: string;
  project_name: string;
  short_description: string;
  target_audience: string;
  segment: string;
  urgency: string;
  status: string;
  current_stage: string;
  admin_budget_amount: string | null;
  budget_sent_at: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  messages_count: number;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

type Tab = "tickets" | "contacts" | "customSaas" | "knowledge" | "users" | "systems";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("tickets");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [systems, setSystems] = useState<SupportSystem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [customSaasRequests, setCustomSaasRequests] = useState<
    CustomSaasRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      openTickets: tickets.filter(
        (ticket) => !["resolved", "closed"].includes(ticket.status),
      ).length,
      contacts: contacts.filter((message) => message.status === "new").length,
      users: users.length,
      knowledge: articles.filter((article) => article.status === "active")
        .length,
      customSaasActive: customSaasRequests.filter(
        (request) => !["completed", "cancelled"].includes(request.status),
      ).length,
    }),
    [tickets, contacts, users, articles, customSaasRequests],
  );

  async function parse<T>(response: Response) {
    const payload = (await response.json()) as ApiResponse<T>;
    if (!response.ok || !payload.ok)
      throw new Error(payload.error || "Erro ao carregar dados.");
    return payload.data as T;
  }

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        ticketsData,
        contactsData,
        usersData,
        systemsData,
        knowledgeData,
        customSaasData,
      ] = await Promise.all([
        fetch("/api/support/tickets?all=1", { cache: "no-store" }).then(
          (response) => parse<{ tickets: Ticket[] }>(response),
        ),
        fetch("/api/admin/contact-messages", { cache: "no-store" }).then(
          (response) => parse<{ messages: ContactMessage[] }>(response),
        ),
        fetch("/api/admin/users", { cache: "no-store" }).then((response) =>
          parse<{ users: UserRow[] }>(response),
        ),
        fetch("/api/support/systems?all=1", { cache: "no-store" }).then((response) =>
          parse<{ systems: SupportSystem[] }>(response),
        ),
        fetch("/api/admin/knowledge", { cache: "no-store" }).then((response) =>
          parse<{ articles: Article[] }>(response),
        ),
        fetch("/api/custom-saas/requests?all=1", { cache: "no-store" }).then(
          (response) => parse<{ requests: CustomSaasRequest[] }>(response),
        ),
      ]);

      setTickets(ticketsData.tickets || []);
      setContacts(contactsData.messages || []);
      setUsers(usersData.users || []);
      setSystems(systemsData.systems || []);
      setArticles(knowledgeData.articles || []);
      setCustomSaasRequests(customSaasData.requests || []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar a área admin.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function updateTicket(
    ticket: Ticket,
    status: string,
    systemId = ticket.system_id,
  ) {
    setSaving(true);
    setError(null);
    try {
      await parse<{ updated: boolean }>(
        await fetch(`/api/support/tickets/${ticket.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, systemId }),
        }),
      );
      await loadAll();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Não foi possível atualizar o ticket.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function createSystem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const form = new FormData(event.currentTarget);
      await parse<{ id: string }>(
        await fetch("/api/support/systems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(form.entries())),
        }),
      );
      event.currentTarget.reset();
      await loadAll();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Não foi possível salvar o sistema.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateSystem(event: FormEvent<HTMLFormElement>, system: SupportSystem) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const form = new FormData(event.currentTarget);
      await parse<{ updated: boolean }>(
        await fetch(`/api/support/systems/${system.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            active: form.get("active") === "true",
          }),
        }),
      );
      await loadAll();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Não foi possível atualizar o sistema.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deactivateSystem(system: SupportSystem) {
    if (!window.confirm(`Remover o sistema ${system.name} da lista de novos tickets? Tickets antigos continuarão preservados.`)) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await parse<{ deactivated: boolean }>(
        await fetch(`/api/support/systems/${system.id}`, { method: "DELETE" }),
      );
      await loadAll();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível remover o sistema.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateContact(message: ContactMessage, status: string) {
    setSaving(true);
    setError(null);
    try {
      await parse<{ updated: boolean }>(
        await fetch(`/api/admin/contact-messages/${message.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }),
      );
      await loadAll();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Não foi possível atualizar a mensagem.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateUser(event: FormEvent<HTMLFormElement>, user: UserRow) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const form = new FormData(event.currentTarget);
      await parse<{ updated: boolean }>(
        await fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            email: form.get("email"),
            role: form.get("role"),
            isActive: form.get("isActive") === "true",
          }),
        }),
      );
      await loadAll();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Não foi possível atualizar o usuário.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deactivateUser(user: UserRow) {
    if (!window.confirm(`Desativar o usuário ${user.name}? O histórico de tickets será preservado.`)) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await parse<{ deactivated: boolean }>(
        await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" }),
      );
      await loadAll();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível desativar o usuário.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function createArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const form = new FormData(event.currentTarget);
      await parse<{ id: string }>(
        await fetch("/api/admin/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(form.entries())),
        }),
      );
      event.currentTarget.reset();
      await loadAll();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Não foi possível salvar o artigo.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function archiveArticle(article: Article) {
    setSaving(true);
    setError(null);
    try {
      await parse<{ updated: boolean }>(
        await fetch(`/api/admin/knowledge/${article.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...article,
            status: article.status === "archived" ? "active" : "archived",
          }),
        }),
      );
      await loadAll();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Não foi possível atualizar o artigo.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-secondary">
          Admin
        </p>
        <h1 className="font-sora text-3xl font-bold">Painel administrativo</h1>
        <p className="mt-2 max-w-3xl text-on-surface-variant">
          Gerencie tickets, solicitações de SaaS personalizado, mensagens do
          formulário de contato, usuários e base de conhecimento usada pela IA.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Metric label="Tickets em aberto" value={stats.openTickets} />
        <Metric label="SaaS em andamento" value={stats.customSaasActive} />
        <Metric label="Contatos novos" value={stats.contacts} />
        <Metric label="Usuários" value={stats.users} />
        <Metric label="Artigos ativos" value={stats.knowledge} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          ["tickets", "Tickets"],
          ["customSaas", "SaaS personalizados"],
          ["contacts", "Contatos"],
          ["knowledge", "Base da IA"],
          ["users", "Usuários"],
          ["systems", "Sistemas"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === key ? "bg-primary text-primary-on" : "border border-surface-high text-on-surface-variant hover:border-primary/40 hover:text-primary"}`}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-surface-high bg-surface-low p-8 text-on-surface-variant">
          Carregando painel...
        </div>
      ) : (
        <>
          {tab === "tickets" && (
            <section className="space-y-4">
              {tickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="rounded-2xl border border-surface-high bg-surface-low p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="font-sora text-lg font-semibold">
                        {ticket.title}
                      </h2>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {ticket.user_name} • {ticket.user_email}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm text-on-surface-variant">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge value={ticket.status} />
                      <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {ticket.system_name || "Sistema não informado"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                    <span className="rounded-full bg-surface-high px-2.5 py-1">
                      {ticket.category}
                    </span>
                    <span className="rounded-full bg-surface-high px-2.5 py-1">
                      {ticket.messages_count} mensagem(ns)
                    </span>
                    <span className="rounded-full bg-surface-high px-2.5 py-1">
                      {ticket.attachments_count} anexo(s)
                    </span>
                    <span className="rounded-full bg-surface-high px-2.5 py-1">
                      Atualizado em {formatDate(ticket.updated_at)}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 lg:grid-cols-[220px_1fr]">
                    <label className="block text-xs font-semibold text-on-surface-variant">
                      Sistema do ticket
                      <select
                        className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-3 py-2 text-xs text-on-surface outline-none focus:border-primary/60"
                        value={ticket.system_id || ""}
                        disabled={saving}
                        onChange={(event) => updateTicket(ticket, ticket.status, event.target.value)}
                      >
                        {!ticket.system_id && <option value="">Sem sistema</option>}
                        {systems.map((system) => (
                          <option key={system.id} value={system.id}>
                            {system.name}{system.active ? "" : " (inativo)"}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex flex-wrap items-end gap-2">
                      <Link
                        className="rounded-lg border border-primary/40 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
                        href={`/suporte/tickets/${ticket.id}`}
                      >
                        Abrir detalhes
                      </Link>
                      {[
                        ["in_progress", "Em andamento"],
                        ["answered", "Respondido"],
                        ["resolved", "Resolvido"],
                        ["closed", "Fechado"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          className="rounded-lg border border-surface-highest px-3 py-2 text-xs font-semibold text-on-surface-variant hover:border-primary/40 hover:text-primary disabled:opacity-60"
                          disabled={saving}
                          onClick={() => updateTicket(ticket, value)}
                          type="button"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
              {tickets.length === 0 && (
                <EmptyState text="Nenhum ticket encontrado." />
              )}
            </section>
          )}

          {tab === "customSaas" && (
            <section className="space-y-4">
              {customSaasRequests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-2xl border border-surface-high bg-surface-low p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="font-sora text-lg font-semibold">
                        {request.project_name}
                      </h2>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {request.user_name} • {request.user_email}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm text-on-surface-variant">
                        {request.short_description}
                      </p>
                    </div>
                    <StatusBadge value={request.status} type="customSaas" />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                    <span className="rounded-full bg-surface-high px-2.5 py-1">
                      Etapa: {request.current_stage}
                    </span>
                    {request.target_audience && (
                      <span className="rounded-full bg-surface-high px-2.5 py-1">
                        Público: {request.target_audience}
                      </span>
                    )}
                    {request.segment && (
                      <span className="rounded-full bg-surface-high px-2.5 py-1">
                        Segmento: {request.segment}
                      </span>
                    )}
                    {request.urgency && (
                      <span className="rounded-full bg-surface-high px-2.5 py-1">
                        Urgência: {request.urgency}
                      </span>
                    )}
                    {request.admin_budget_amount && (
                      <span className="rounded-full bg-surface-high px-2.5 py-1">
                        Orçamento: {formatCurrency(request.admin_budget_amount)}
                      </span>
                    )}
                    <span className="rounded-full bg-surface-high px-2.5 py-1">
                      {request.messages_count} mensagem(ns)
                    </span>
                    <span className="rounded-full bg-surface-high px-2.5 py-1">
                      Atualizado em {formatDate(request.updated_at)}
                    </span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      className="rounded-lg border border-primary/40 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
                      href={`/suporte/solicitacoes-saas/${request.id}`}
                    >
                      Abrir análise
                    </Link>
                  </div>
                </article>
              ))}
              {customSaasRequests.length === 0 && (
                <EmptyState text="Nenhuma solicitação de SaaS personalizado encontrada." />
              )}
            </section>
          )}

          {tab === "contacts" && (
            <section className="space-y-4">
              {contacts.map((message) => (
                <article
                  key={message.id}
                  className="rounded-2xl border border-surface-high bg-surface-low p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="font-sora text-lg font-semibold">
                        {message.subject || "Contato pelo site"}
                      </h2>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {message.name} • {message.email}
                      </p>
                      <p className="mt-3 whitespace-pre-wrap text-sm text-on-surface-variant">
                        {message.message || "Sem mensagem adicional."}
                      </p>
                    </div>
                    <StatusBadge value={message.status} type="contact" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                    {message.phone && (
                      <span className="rounded-full bg-surface-high px-2.5 py-1">
                        {message.phone}
                      </span>
                    )}
                    {message.company && (
                      <span className="rounded-full bg-surface-high px-2.5 py-1">
                        {message.company}
                      </span>
                    )}
                    {message.product_slug && (
                      <span className="rounded-full bg-surface-high px-2.5 py-1">
                        Produto: {message.product_slug}
                      </span>
                    )}
                    <span className="rounded-full bg-surface-high px-2.5 py-1">
                      Recebida em {formatDate(message.created_at)}
                    </span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      ["read", "Lida"],
                      ["in_progress", "Em atendimento"],
                      ["resolved", "Resolvida"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        className="rounded-lg border border-surface-highest px-3 py-2 text-xs font-semibold text-on-surface-variant hover:border-primary/40 hover:text-primary disabled:opacity-60"
                        disabled={saving}
                        onClick={() => updateContact(message, value)}
                        type="button"
                      >
                        Marcar como {label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
              {contacts.length === 0 && (
                <EmptyState text="Nenhuma mensagem de contato recebida." />
              )}
            </section>
          )}

          {tab === "knowledge" && (
            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <form
                className="rounded-2xl border border-surface-high bg-surface-low p-5"
                onSubmit={createArticle}
              >
                <h2 className="font-sora text-lg font-semibold">
                  Novo artigo da base
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Este conteúdo será usado pela IA de suporte como contexto
                  interno.
                </p>
                <label className="mt-5 block text-sm font-medium text-on-surface-variant">
                  Título *
                  <input
                    className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none focus:border-primary/60"
                    name="title"
                    required
                    minLength={4}
                  />
                </label>
                <label className="mt-4 block text-sm font-medium text-on-surface-variant">
                  Categoria
                  <input
                    className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none focus:border-primary/60"
                    name="category"
                    placeholder="Ex.: Acesso, tickets, cobrança"
                  />
                </label>
                <label className="mt-4 block text-sm font-medium text-on-surface-variant">
                  Status
                  <select
                    className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none focus:border-primary/60"
                    name="status"
                    defaultValue="active"
                  >
                    <option value="active">Ativo</option>
                    <option value="draft">Rascunho</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </label>
                <label className="mt-4 block text-sm font-medium text-on-surface-variant">
                  Conteúdo *
                  <textarea
                    className="mt-1.5 min-h-40 w-full resize-none rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none focus:border-primary/60"
                    name="content"
                    required
                    minLength={20}
                  />
                </label>
                <button
                  className="mt-5 w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow disabled:opacity-60"
                  disabled={saving}
                  type="submit"
                >
                  Salvar artigo
                </button>
              </form>

              <div className="space-y-4">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="rounded-2xl border border-surface-high bg-surface-low p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="font-sora text-lg font-semibold">
                          {article.title}
                        </h2>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {article.category} • Atualizado em{" "}
                          {formatDate(article.updated_at)}
                        </p>
                      </div>
                      <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {article.status}
                      </span>
                    </div>
                    <p className="mt-4 line-clamp-3 text-sm text-on-surface-variant">
                      {article.content}
                    </p>
                    <button
                      className="mt-5 rounded-lg border border-surface-highest px-3 py-2 text-xs font-semibold text-on-surface-variant hover:border-primary/40 hover:text-primary disabled:opacity-60"
                      disabled={saving}
                      onClick={() => archiveArticle(article)}
                      type="button"
                    >
                      {article.status === "archived" ? "Reativar" : "Arquivar"}
                    </button>
                  </article>
                ))}
                {articles.length === 0 && (
                  <EmptyState text="Nenhum artigo cadastrado." />
                )}
              </div>
            </section>
          )}

          {tab === "systems" && (
            <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <form
                className="rounded-2xl border border-surface-high bg-surface-low p-5"
                onSubmit={createSystem}
              >
                <h2 className="font-sora text-lg font-semibold">Novo sistema</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Cadastre sistemas que poderão ser selecionados pelo usuário ao abrir um ticket.
                </p>
                <label className="mt-5 block text-sm font-medium text-on-surface-variant">
                  Nome do sistema *
                  <input
                    className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none focus:border-primary/60"
                    name="name"
                    required
                    minLength={2}
                    placeholder="Ex.: Novo SaaS"
                  />
                </label>
                <button
                  className="mt-5 w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow disabled:opacity-60"
                  disabled={saving}
                  type="submit"
                >
                  Adicionar sistema
                </button>
              </form>

              <div className="space-y-4">
                {systems.map((system) => (
                  <form
                    key={system.id}
                    className="rounded-2xl border border-surface-high bg-surface-low p-5"
                    onSubmit={(event) => updateSystem(event, system)}
                  >
                    <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                      <label className="block text-sm font-medium text-on-surface-variant">
                        Sistema
                        <input
                          className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none focus:border-primary/60"
                          name="name"
                          defaultValue={system.name}
                          required
                          minLength={2}
                        />
                      </label>
                      <label className="block text-sm font-medium text-on-surface-variant">
                        Status
                        <select
                          className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none focus:border-primary/60"
                          name="active"
                          defaultValue={system.active ? "true" : "false"}
                        >
                          <option value="true">Ativo</option>
                          <option value="false">Inativo</option>
                        </select>
                      </label>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-on-surface-variant">
                      <span className="rounded-full bg-surface-high px-2.5 py-1">
                        {system.tickets_count} ticket(s) vinculados
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-lg border border-primary/40 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-60"
                          disabled={saving}
                          type="submit"
                        >
                          Salvar
                        </button>
                        <button
                          className="rounded-lg border border-error/30 px-3 py-2 text-xs font-semibold text-error hover:bg-error/10 disabled:opacity-60"
                          disabled={saving || !system.active}
                          onClick={() => deactivateSystem(system)}
                          type="button"
                        >
                          Remover da lista
                        </button>
                      </div>
                    </div>
                  </form>
                ))}
                {systems.length === 0 && (
                  <EmptyState text="Nenhum sistema cadastrado." />
                )}
              </div>
            </section>
          )}

          {tab === "users" && (
            <section className="space-y-4">
              {users.map((user) => (
                <form
                  key={user.id}
                  className="rounded-2xl border border-surface-high bg-surface-low p-5"
                  onSubmit={(event) => updateUser(event, user)}
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_1fr_160px_160px]">
                    <label className="block text-sm font-medium text-on-surface-variant">
                      Nome
                      <input
                        className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none focus:border-primary/60"
                        name="name"
                        defaultValue={user.name}
                        required
                        minLength={2}
                      />
                    </label>
                    <label className="block text-sm font-medium text-on-surface-variant">
                      E-mail
                      <input
                        className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none focus:border-primary/60"
                        name="email"
                        type="email"
                        defaultValue={user.email}
                        required
                      />
                    </label>
                    <label className="block text-sm font-medium text-on-surface-variant">
                      Perfil
                      <select
                        className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none focus:border-primary/60"
                        name="role"
                        defaultValue={user.role}
                      >
                        <option value="user">Usuário</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-on-surface-variant">
                      Status
                      <select
                        className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none focus:border-primary/60"
                        name="isActive"
                        defaultValue={user.is_active ? "true" : "false"}
                      >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                    </label>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-on-surface-variant">
                    <span className="rounded-full bg-surface-high px-2.5 py-1">
                      {user.tickets_count} ticket(s) • Criado em {formatDate(user.created_at)}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-lg border border-primary/40 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-60"
                        disabled={saving}
                        type="submit"
                      >
                        Salvar usuário
                      </button>
                      <button
                        className="rounded-lg border border-error/30 px-3 py-2 text-xs font-semibold text-error hover:bg-error/10 disabled:opacity-60"
                        disabled={saving || !user.is_active}
                        onClick={() => deactivateUser(user)}
                        type="button"
                      >
                        Excluir/desativar
                      </button>
                    </div>
                  </div>
                </form>
              ))}
              {users.length === 0 && (
                <EmptyState text="Nenhum usuário cadastrado." />
              )}
            </section>
          )}
        </>
      )}
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-surface-high bg-surface-low p-5">
      <p className="text-sm text-on-surface-variant">{label}</p>
      <p className="mt-2 font-sora text-3xl font-bold text-primary">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-surface-high bg-surface-low p-8 text-sm text-on-surface-variant">
      {text}
    </div>
  );
}

function formatCurrency(value: string | null) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}
