"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { StatusBadge, formatDate } from "@/components/StatusBadge";
import {
  customSaasDefaultStages,
  customSaasFieldSections,
  customSaasStatuses,
  customSaasStatusLabels,
  type CustomSaasStatus,
} from "@/lib/custom-saas";

interface CustomSaasRequest {
  id: string;
  user_id: string;
  project_name: string;
  short_description: string;
  problem_solved: string;
  main_goal: string;
  target_audience: string;
  segment: string;
  urgency: string;
  desired_deadline: string;
  desired_features: string;
  expected_screens: string;
  user_profiles: string;
  permissions_needed: string;
  main_flows: string;
  desired_automations: string;
  reports_dashboards: string;
  data_to_register: string;
  data_import_export: string;
  required_integrations: string;
  external_apis: string;
  payments_subscriptions: string;
  ai_usage: string;
  notifications_webhooks: string;
  similar_systems: string;
  visual_preference: string;
  device_usage: string;
  responsiveness_need: string;
  accessibility_need: string;
  estimated_budget: string;
  business_model: string;
  multi_tenant_need: string;
  admin_panel_need: string;
  hosting_need: string;
  additional_notes: string;
  attachment_notes: string;
  status: CustomSaasStatus;
  current_stage: string;
  admin_budget_amount: string | null;
  admin_budget_notes: string;
  user_budget_response: string;
  budget_sent_at: string | null;
  budget_approved_at: string | null;
  budget_declined_at: string | null;
  build_started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
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

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const inputClass = "mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30";

export default function CustomSaasRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const adminFormRef = useRef<HTMLFormElement>(null);
  const [request, setRequest] = useState<CustomSaasRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "user">("user");
  const [userBudgetResponse, setUserBudgetResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin = currentUserRole === "admin";

  const fieldValues = useMemo(() => (request ? getFieldValues(request) : {}), [request]);

  async function parse<T>(response: Response) {
    const payload = (await response.json()) as ApiResponse<T>;
    if (!response.ok || !payload.ok) throw new Error(payload.error || "Não foi possível concluir a operação.");
    return payload.data as T;
  }

  async function loadRequest() {
    setError(null);
    const data = await parse<{ request: CustomSaasRequest; messages: Message[]; current_user_role: "admin" | "user" }>(
      await fetch(`/api/custom-saas/requests/${params.id}`, { cache: "no-store" }),
    );
    setRequest(data.request);
    setMessages(data.messages || []);
    setCurrentUserRole(data.current_user_role);
    setLoading(false);
  }

  useEffect(() => {
    loadRequest().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar a solicitação.");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData(event.currentTarget);
      await parse<{ created: boolean }>(await fetch(`/api/custom-saas/requests/${params.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      }));
      event.currentTarget.reset();
      setSuccess("Mensagem enviada com sucesso.");
      await loadRequest();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Não foi possível enviar a mensagem.");
    } finally {
      setSaving(false);
    }
  }

  async function respondBudget(action: "approve_budget" | "decline_budget") {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await parse<{ updated: boolean }>(await fetch(`/api/custom-saas/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userBudgetResponse }),
      }));
      setUserBudgetResponse("");
      setSuccess(action === "approve_budget" ? "Orçamento aprovado com sucesso." : "Orçamento recusado com sucesso.");
      await loadRequest();
    } catch (respondError) {
      setError(respondError instanceof Error ? respondError.message : "Não foi possível responder ao orçamento.");
    } finally {
      setSaving(false);
    }
  }

  async function updateAdminRequest(action: "update_status" | "send_budget") {
    if (!adminFormRef.current) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData(adminFormRef.current);
      await parse<{ updated: boolean }>(await fetch(`/api/custom-saas/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(form.entries()), action }),
      }));
      setSuccess(action === "send_budget" ? "Orçamento enviado/atualizado com sucesso." : "Solicitação atualizada com sucesso.");
      adminFormRef.current.reset();
      await loadRequest();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Não foi possível atualizar a solicitação.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <Link href={isAdmin ? "/admin" : "/suporte/solicitacoes-saas"} className="mb-6 inline-flex text-sm text-on-surface-variant transition hover:text-primary">
        ← Voltar
      </Link>

      {error && <div className="mb-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</div>}
      {success && <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">{success}</div>}

      {loading ? (
        <div className="rounded-2xl border border-surface-high bg-surface-low p-8 text-sm text-on-surface-variant">Carregando solicitação...</div>
      ) : !request ? (
        <div className="rounded-2xl border border-surface-high bg-surface-low p-8 text-sm text-on-surface-variant">Solicitação não encontrada.</div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <article className="rounded-2xl border border-surface-high bg-surface-low p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">Solicitação de SaaS</p>
                  <h1 className="font-sora text-3xl font-bold">{request.project_name}</h1>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Criada por {request.user_name} em {formatDate(request.created_at)}
                  </p>
                </div>
                <StatusBadge value={request.status} type="customSaas" />
              </div>
              <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">{request.short_description}</p>
            </article>

            {customSaasFieldSections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-surface-high bg-surface-low p-6">
                <h2 className="font-sora text-xl font-semibold">{section.title}</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{field.label}</p>
                      <p className="mt-1 whitespace-pre-wrap rounded-xl border border-surface-high bg-background p-3 text-sm leading-relaxed text-on-surface-variant">
                        {fieldValues[field.name] || "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}

            <article className="rounded-2xl border border-surface-high bg-surface-low p-6">
              <h2 className="font-sora text-xl font-semibold">Histórico da solicitação</h2>
              <div className="mt-5 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-xl border p-4 ${message.author_type === "admin" ? "border-secondary/30 bg-secondary/10" : "border-surface-high bg-background"}`}
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
                      <span className="font-semibold text-on-surface">
                        {message.author_type === "admin" ? "Equipe SelectSaaS" : message.author_name || "Usuário"}
                      </span>
                      <span>{formatDate(message.created_at)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">{message.message}</p>
                  </div>
                ))}
                {messages.length === 0 && <p className="rounded-xl border border-surface-high bg-background p-4 text-sm text-on-surface-variant">Nenhuma mensagem registrada.</p>}
              </div>

              <form className="mt-6 space-y-4" onSubmit={sendMessage}>
                <label className="block text-sm font-medium text-on-surface-variant">
                  Responder no histórico
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    name="message"
                    required
                    placeholder="Digite uma mensagem para continuar a conversa sobre esta solicitação..."
                  />
                </label>
                <button
                  className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? "Enviando..." : "Enviar mensagem"}
                </button>
              </form>
            </article>
          </section>

          <aside className="space-y-4">
            <article className="rounded-2xl border border-surface-high bg-surface-low p-6">
              <h2 className="font-sora text-lg font-semibold">Etapa atual</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Info label="Status" value={customSaasStatusLabels[request.status]} />
                <Info label="Etapa" value={request.current_stage} />
                <Info label="Atualizado" value={formatDate(request.updated_at)} />
                <Info label="Solicitante" value={`${request.user_name} • ${request.user_email}`} />
              </dl>
            </article>

            <article className="rounded-2xl border border-surface-high bg-surface-low p-6">
              <h2 className="font-sora text-lg font-semibold">Orçamento</h2>
              {request.admin_budget_amount || request.admin_budget_notes ? (
                <div className="mt-4 space-y-3 text-sm text-on-surface-variant">
                  {request.admin_budget_amount && <p className="font-sora text-2xl font-bold text-primary">{formatCurrency(request.admin_budget_amount)}</p>}
                  {request.admin_budget_notes && <p className="whitespace-pre-wrap rounded-xl border border-surface-high bg-background p-3">{request.admin_budget_notes}</p>}
                  {request.budget_sent_at && <p>Enviado em {formatDate(request.budget_sent_at)}</p>}
                  {request.user_budget_response && <p className="whitespace-pre-wrap rounded-xl border border-surface-high bg-background p-3">Resposta do usuário: {request.user_budget_response}</p>}
                </div>
              ) : (
                <p className="mt-3 text-sm text-on-surface-variant">O orçamento ainda não foi enviado pela equipe administrativa.</p>
              )}

              {!isAdmin && request.status === "budget_sent" && (
                <div className="mt-5 space-y-4">
                  <label className="block text-sm font-medium text-on-surface-variant">
                    Comentário sobre o orçamento
                    <textarea
                      className={`${inputClass} min-h-24 resize-y`}
                      value={userBudgetResponse}
                      onChange={(event) => setUserBudgetResponse(event.target.value)}
                      placeholder="Opcional. Informe dúvidas, ajustes ou confirmação."
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-on glow transition hover:bg-primary-dim disabled:opacity-60"
                      disabled={saving}
                      onClick={() => respondBudget("approve_budget")}
                      type="button"
                    >
                      Aprovar orçamento
                    </button>
                    <button
                      className="rounded-lg border border-error/40 px-4 py-3 text-sm font-semibold text-error transition hover:bg-error/10 disabled:opacity-60"
                      disabled={saving}
                      onClick={() => respondBudget("decline_budget")}
                      type="button"
                    >
                      Recusar orçamento
                    </button>
                  </div>
                </div>
              )}
            </article>

            {isAdmin && (
              <article className="rounded-2xl border border-secondary/30 bg-surface-low p-6">
                <h2 className="font-sora text-lg font-semibold">Gestão admin</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Envie orçamento, atualize a etapa e registre mensagens sem perder o histórico.</p>
                <form key={request.updated_at} ref={adminFormRef} className="mt-5 space-y-4" onSubmit={(event) => event.preventDefault()}>
                  <label className="block text-sm font-medium text-on-surface-variant">
                    Status
                    <select className={inputClass} name="status" defaultValue={request.status}>
                      {customSaasStatuses.map((status) => (
                        <option key={status} value={status}>{customSaasStatusLabels[status]}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-on-surface-variant">
                    Etapa atual
                    <input className={inputClass} name="currentStage" defaultValue={request.current_stage || customSaasDefaultStages[request.status]} />
                  </label>

                  <label className="block text-sm font-medium text-on-surface-variant">
                    Valor do orçamento
                    <input className={inputClass} name="adminBudgetAmount" defaultValue={request.admin_budget_amount || ""} placeholder="Ex.: 12000,00" inputMode="decimal" />
                  </label>

                  <label className="block text-sm font-medium text-on-surface-variant">
                    Observações do orçamento
                    <textarea className={`${inputClass} min-h-28 resize-y`} name="adminBudgetNotes" defaultValue={request.admin_budget_notes || ""} placeholder="Inclua escopo, prazo, condições de pagamento e observações." />
                  </label>

                  <label className="block text-sm font-medium text-on-surface-variant">
                    Mensagem para o histórico
                    <textarea className={`${inputClass} min-h-24 resize-y`} name="adminMessage" placeholder="Opcional. Escreva uma resposta para o usuário." />
                  </label>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      className="rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
                      disabled={saving}
                      onClick={() => updateAdminRequest("send_budget")}
                      type="button"
                    >
                      Enviar/atualizar orçamento
                    </button>
                    <button
                      className="rounded-lg border border-surface-highest px-4 py-3 text-sm font-semibold text-on-surface-variant transition hover:border-primary/40 hover:text-primary disabled:opacity-60"
                      disabled={saving}
                      onClick={() => updateAdminRequest("update_status")}
                      type="button"
                    >
                      Atualizar status/etapa
                    </button>
                  </div>
                </form>
              </article>
            )}
          </aside>
        </div>
      )}
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="break-words font-semibold">{value || "-"}</dd>
    </div>
  );
}

function formatCurrency(value: string | null) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
}

function getFieldValues(request: CustomSaasRequest): Record<string, string> {
  return {
    projectName: request.project_name,
    shortDescription: request.short_description,
    problemSolved: request.problem_solved,
    mainGoal: request.main_goal,
    targetAudience: request.target_audience,
    segment: request.segment,
    urgency: request.urgency,
    desiredDeadline: request.desired_deadline,
    desiredFeatures: request.desired_features,
    expectedScreens: request.expected_screens,
    userProfiles: request.user_profiles,
    permissionsNeeded: request.permissions_needed,
    mainFlows: request.main_flows,
    desiredAutomations: request.desired_automations,
    reportsDashboards: request.reports_dashboards,
    dataToRegister: request.data_to_register,
    dataImportExport: request.data_import_export,
    requiredIntegrations: request.required_integrations,
    externalApis: request.external_apis,
    paymentsSubscriptions: request.payments_subscriptions,
    aiUsage: request.ai_usage,
    notificationsWebhooks: request.notifications_webhooks,
    similarSystems: request.similar_systems,
    visualPreference: request.visual_preference,
    deviceUsage: request.device_usage,
    responsivenessNeed: request.responsiveness_need,
    accessibilityNeed: request.accessibility_need,
    estimatedBudget: request.estimated_budget,
    businessModel: request.business_model,
    multiTenantNeed: request.multi_tenant_need,
    adminPanelNeed: request.admin_panel_need,
    hostingNeed: request.hosting_need,
    additionalNotes: request.additional_notes,
    attachmentNotes: request.attachment_notes,
  };
}
