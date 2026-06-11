"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { StatusBadge, formatDate } from "@/components/StatusBadge";

interface CustomSaasRequestSummary {
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
  budget_approved_at: string | null;
  budget_declined_at: string | null;
  build_started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  messages_count: number;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export default function CustomSaasRequestsPage() {
  const [requests, setRequests] = useState<CustomSaasRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pendingBudgetCount = useMemo(
    () => requests.filter((request) => request.status === "budget_sent").length,
    [requests],
  );

  async function loadRequests() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/custom-saas/requests", { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<{ requests: CustomSaasRequestSummary[] }>;

    setLoading(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error || "Não foi possível carregar suas solicitações.");
      return;
    }

    setRequests(payload.data?.requests || []);
  }

  useEffect(() => {
    loadRequests().catch(() => {
      setLoading(false);
      setError("Não foi possível carregar suas solicitações.");
    });
  }, []);

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">SaaS personalizado</p>
          <h1 className="font-sora text-3xl font-bold">Minhas solicitações</h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            Acompanhe propostas de desenvolvimento, orçamento, aprovação e evolução da construção do seu SaaS.
          </p>
        </div>
        <Link
          href="/solicitar-saas"
          className="rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-on glow transition hover:bg-primary-dim"
        >
          Nova solicitação
        </Link>
      </div>

      {error && <div className="mb-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</div>}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric label="Solicitações" value={requests.length} />
        <Metric label="Orçamentos pendentes" value={pendingBudgetCount} />
        <Metric label="Em andamento" value={requests.filter((request) => ["budget_approved", "in_build", "in_review"].includes(request.status)).length} />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-surface-high bg-surface-low p-8 text-sm text-on-surface-variant">Carregando solicitações...</div>
      ) : requests.length === 0 ? (
        <section className="rounded-2xl border border-surface-high bg-surface-low p-8 text-center">
          <h2 className="font-sora text-xl font-semibold">Nenhuma solicitação criada</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
            Crie sua primeira solicitação para que a equipe analise a ideia, envie orçamento e acompanhe o processo por aqui.
          </p>
          <Link
            href="/solicitar-saas"
            className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-on glow transition hover:bg-primary-dim"
          >
            Solicitar SaaS personalizado
          </Link>
        </section>
      ) : (
        <section className="space-y-4">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/suporte/solicitacoes-saas/${request.id}`}
              className="block rounded-2xl border border-surface-high bg-surface-low p-5 transition hover:border-primary/40"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="font-sora text-lg font-semibold text-on-surface">{request.project_name}</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">{request.target_audience}{request.segment ? ` • ${request.segment}` : ""}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-on-surface-variant">{request.short_description}</p>
                </div>
                <StatusBadge value={request.status} type="customSaas" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                <span className="rounded-full bg-surface-high px-2.5 py-1">Etapa: {request.current_stage}</span>
                {request.urgency && <span className="rounded-full bg-surface-high px-2.5 py-1">Urgência: {request.urgency}</span>}
                {request.admin_budget_amount && <span className="rounded-full bg-surface-high px-2.5 py-1">Orçamento: {formatCurrency(request.admin_budget_amount)}</span>}
                <span className="rounded-full bg-surface-high px-2.5 py-1">{request.messages_count} mensagem(ns)</span>
                <span className="rounded-full bg-surface-high px-2.5 py-1">Atualizado em {formatDate(request.updated_at)}</span>
              </div>
            </Link>
          ))}
        </section>
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

function formatCurrency(value: string | null) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
}
