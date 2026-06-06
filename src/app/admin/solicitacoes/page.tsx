"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Solicitacao {
  id: string;
  nome_completo: string;
  nome_empresa: string;
  email: string;
  telefone: string;
  segmento: string;
  status: string;
  prioridade: string;
  responsavel: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  novo: "Novo",
  em_analise: "Em análise",
  em_contato: "Em contato",
  proposta_enviada: "Proposta enviada",
  em_desenvolvimento: "Em desenvolvimento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  novo: "text-primary border-primary/40 bg-primary/10",
  em_analise: "text-blue-400 border-blue-400/40 bg-blue-400/10",
  em_contato: "text-purple-400 border-purple-400/40 bg-purple-400/10",
  proposta_enviada: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  em_desenvolvimento: "text-green-400 border-green-400/40 bg-green-400/10",
  concluido: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
  cancelado: "text-error border-error/40 bg-error/10",
};

const PRIORIDADE_LABELS: Record<string, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
};

const PRIORIDADE_COLORS: Record<string, string> = {
  baixa: "text-on-surface-variant border-surface-highest bg-surface-highest/50",
  normal: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  alta: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  urgente: "text-error border-error/40 bg-error/10",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminSolicitacoesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPrioridade, setFilterPrioridade] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterPrioridade) params.set("prioridade", filterPrioridade);
      const res = await fetch(`/api/admin/solicitacoes?${params}`);
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setItems(data.solicitacoes ?? []);
    } catch {
      setError("Não foi possível carregar as solicitações.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPrioridade, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-surface-high">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-sora font-bold text-lg text-gradient">
              SelectSaaS
            </Link>
            <span className="text-on-surface-variant text-sm hidden sm:inline">
              / Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-on-surface-variant hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-high"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-sora text-2xl sm:text-3xl font-bold text-on-surface mb-1">
            Solicitações de SaaS
          </h1>
          <p className="text-on-surface-variant text-sm">
            Gerencie todas as solicitações de desenvolvimento recebidas.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface-low border border-surface-highest rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-primary/60 transition-colors"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          <select
            value={filterPrioridade}
            onChange={(e) => setFilterPrioridade(e.target.value)}
            className="bg-surface-low border border-surface-highest rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-primary/60 transition-colors"
          >
            <option value="">Todas as prioridades</option>
            {Object.entries(PRIORIDADE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          <button
            onClick={load}
            className="px-3 py-2 border border-surface-highest rounded-lg text-on-surface-variant hover:text-primary hover:border-primary/40 text-sm transition-colors"
          >
            Atualizar
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {!loading && error && (
          <div className="bg-error/10 border border-error/30 rounded-xl px-6 py-4 text-error text-sm">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-24 text-on-surface-variant">
            <p className="text-lg font-medium mb-2">Nenhuma solicitação encontrada</p>
            <p className="text-sm">Ajuste os filtros ou aguarde novas solicitações.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/solicitacoes/${item.id}`}
                  className="block bg-surface-low border border-surface-high rounded-xl p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-sora font-semibold text-on-surface text-sm">{item.nome_completo}</p>
                      <p className="text-on-surface-variant text-xs">{item.nome_empresa}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_COLORS[item.status] ?? ""}`}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-on-surface-variant">
                    <span>{item.segmento}</span>
                    <span>·</span>
                    <span className={`px-1.5 py-0.5 rounded border text-xs ${PRIORIDADE_COLORS[item.prioridade] ?? ""}`}>
                      {PRIORIDADE_LABELS[item.prioridade] ?? item.prioridade}
                    </span>
                    <span>·</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block bg-surface-low border border-surface-high rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-high">
                    <th className="text-left px-5 py-3.5 text-on-surface-variant font-medium text-xs uppercase tracking-wider">Solicitante</th>
                    <th className="text-left px-4 py-3.5 text-on-surface-variant font-medium text-xs uppercase tracking-wider">Empresa</th>
                    <th className="text-left px-4 py-3.5 text-on-surface-variant font-medium text-xs uppercase tracking-wider">Segmento</th>
                    <th className="text-left px-4 py-3.5 text-on-surface-variant font-medium text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3.5 text-on-surface-variant font-medium text-xs uppercase tracking-wider">Prioridade</th>
                    <th className="text-left px-4 py-3.5 text-on-surface-variant font-medium text-xs uppercase tracking-wider">Recebido em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-high">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-surface/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/solicitacoes/${item.id}`)}
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-on-surface">{item.nome_completo}</p>
                        <p className="text-on-surface-variant text-xs">{item.email}</p>
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant">{item.nome_empresa}</td>
                      <td className="px-4 py-4 text-on-surface-variant">{item.segmento}</td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[item.status] ?? ""}`}>
                          {STATUS_LABELS[item.status] ?? item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${PRIORIDADE_COLORS[item.prioridade] ?? ""}`}>
                          {PRIORIDADE_LABELS[item.prioridade] ?? item.prioridade}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant text-xs">{formatDate(item.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-on-surface-variant text-xs mt-4 text-right">
              {items.length} solicitaç{items.length === 1 ? "ão" : "ões"}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
