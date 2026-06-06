"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Solicitacao {
  id: string;
  nome_completo: string;
  nome_empresa: string;
  email: string;
  telefone: string;
  cidade_estado: string | null;
  segmento: string;
  tamanho_empresa: string | null;
  qtd_usuarios: string | null;
  problemas_resolver: string;
  descricao_ideia: string;
  funcionalidades: string | null;
  processos_automatizar: string | null;
  perfis_usuarios: string | null;
  precisa_area_admin: string | null;
  precisa_login: string | null;
  precisa_pagamentos: string | null;
  precisa_relatorios: string | null;
  precisa_upload: string | null;
  precisa_integracoes: string | null;
  precisa_mobile: string | null;
  prazo_desejado: string | null;
  faixa_orcamento: string | null;
  observacoes: string | null;
  status: string;
  prioridade: string;
  observacoes_internas: string | null;
  responsavel: string | null;
  created_at: string;
  updated_at: string;
}

const STATUSES = [
  { value: "novo", label: "Novo" },
  { value: "em_analise", label: "Em análise" },
  { value: "em_contato", label: "Em contato" },
  { value: "proposta_enviada", label: "Proposta enviada" },
  { value: "em_desenvolvimento", label: "Em desenvolvimento" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

const PRIORIDADES = [
  { value: "baixa", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

const STATUS_COLORS: Record<string, string> = {
  novo: "text-primary border-primary/40 bg-primary/10",
  em_analise: "text-blue-400 border-blue-400/40 bg-blue-400/10",
  em_contato: "text-purple-400 border-purple-400/40 bg-purple-400/10",
  proposta_enviada: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  em_desenvolvimento: "text-green-400 border-green-400/40 bg-green-400/10",
  concluido: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
  cancelado: "text-error border-error/40 bg-error/10",
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

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-on-surface-variant mb-0.5">{label}</dt>
      <dd className="text-on-surface text-sm leading-relaxed">{value}</dd>
    </div>
  );
}

const inputClass =
  "w-full bg-surface border border-surface-highest rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors";

export default function AdminSolicitacaoDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [item, setItem] = useState<Solicitacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit state
  const [editStatus, setEditStatus] = useState("");
  const [editPrioridade, setEditPrioridade] = useState("");
  const [editObsInternas, setEditObsInternas] = useState("");
  const [editResponsavel, setEditResponsavel] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/solicitacoes/${params.id}`);
        if (res.status === 401) { router.replace("/admin/login"); return; }
        if (!res.ok) { setError("Solicitação não encontrada."); return; }
        const data = await res.json();
        const s: Solicitacao = data.solicitacao;
        setItem(s);
        setEditStatus(s.status);
        setEditPrioridade(s.prioridade);
        setEditObsInternas(s.observacoes_internas ?? "");
        setEditResponsavel(s.responsavel ?? "");
      } catch {
        setError("Erro ao carregar solicitação.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("loading");
    try {
      const res = await fetch(`/api/admin/solicitacoes/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          prioridade: editPrioridade,
          observacoesInternas: editObsInternas || null,
          responsavel: editResponsavel || null,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setSaveStatus("success");
      // update local state
      setItem((prev) =>
        prev
          ? {
              ...prev,
              status: editStatus,
              prioridade: editPrioridade,
              observacoes_internas: editObsInternas || null,
              responsavel: editResponsavel || null,
            }
          : prev
      );
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

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
            <Link href="/" className="font-sora font-bold text-lg text-gradient">SelectSaaS</Link>
            <span className="text-on-surface-variant text-sm hidden sm:inline">/ Admin</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-on-surface-variant hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-high">
            Sair
          </button>
        </div>
      </header>

      <main className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin/solicitacoes" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary text-sm mb-6 transition-colors">
          ← Voltar à lista
        </Link>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {!loading && error && (
          <div className="bg-error/10 border border-error/30 rounded-xl px-6 py-4 text-error text-sm">{error}</div>
        )}

        {!loading && !error && item && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left — full data */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card */}
              <div className="bg-surface-low border border-surface-high rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="font-sora text-xl font-bold text-on-surface">{item.nome_completo}</h1>
                    <p className="text-on-surface-variant text-sm">{item.nome_empresa}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_COLORS[item.status] ?? ""}`}>
                    {STATUSES.find((s) => s.value === item.status)?.label ?? item.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="E-mail" value={item.email} />
                  <Field label="Telefone / WhatsApp" value={item.telefone} />
                  <Field label="Cidade / Estado" value={item.cidade_estado} />
                  <Field label="Recebido em" value={formatDate(item.created_at)} />
                </div>
              </div>

              {/* Negócio */}
              <div className="bg-surface-low border border-surface-high rounded-xl p-6">
                <h2 className="font-sora text-sm font-semibold text-on-surface mb-4 pb-2 border-b border-surface-high">Sobre o negócio</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Segmento" value={item.segmento} />
                  <Field label="Tamanho da empresa" value={item.tamanho_empresa} />
                  <Field label="Qtd. usuários estimada" value={item.qtd_usuarios} />
                </dl>
                {item.problemas_resolver && (
                  <div className="mt-4">
                    <dt className="text-xs text-on-surface-variant mb-1">Problemas a resolver</dt>
                    <dd className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{item.problemas_resolver}</dd>
                  </div>
                )}
              </div>

              {/* SaaS desejado */}
              <div className="bg-surface-low border border-surface-high rounded-xl p-6">
                <h2 className="font-sora text-sm font-semibold text-on-surface mb-4 pb-2 border-b border-surface-high">Sobre o SaaS desejado</h2>
                <div className="space-y-4">
                  {item.descricao_ideia && (
                    <div>
                      <dt className="text-xs text-on-surface-variant mb-1">Descrição da ideia</dt>
                      <dd className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{item.descricao_ideia}</dd>
                    </div>
                  )}
                  {item.funcionalidades && (
                    <div>
                      <dt className="text-xs text-on-surface-variant mb-1">Funcionalidades desejadas</dt>
                      <dd className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{item.funcionalidades}</dd>
                    </div>
                  )}
                  {item.processos_automatizar && (
                    <div>
                      <dt className="text-xs text-on-surface-variant mb-1">Processos a automatizar</dt>
                      <dd className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{item.processos_automatizar}</dd>
                    </div>
                  )}
                  <Field label="Perfis de usuários" value={item.perfis_usuarios} />

                  {/* Requisitos técnicos */}
                  <div>
                    <p className="text-xs text-on-surface-variant mb-2">Requisitos técnicos</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        ["Área admin", item.precisa_area_admin],
                        ["Login/auth", item.precisa_login],
                        ["Pagamentos", item.precisa_pagamentos],
                        ["Relatórios", item.precisa_relatorios],
                        ["Upload", item.precisa_upload],
                        ["Integrações", item.precisa_integracoes],
                        ["Mobile", item.precisa_mobile],
                      ].map(([label, val]) =>
                        val ? (
                          <div key={label as string} className="text-xs bg-surface border border-surface-high rounded px-2.5 py-1.5">
                            <span className="text-on-surface-variant">{label}:</span>{" "}
                            <span className="text-on-surface capitalize">{val as string}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prazo & Orçamento */}
              <div className="bg-surface-low border border-surface-high rounded-xl p-6">
                <h2 className="font-sora text-sm font-semibold text-on-surface mb-4 pb-2 border-b border-surface-high">Prazo e orçamento</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Prazo desejado" value={item.prazo_desejado} />
                  <Field label="Faixa de investimento" value={item.faixa_orcamento} />
                </dl>
                {item.observacoes && (
                  <div className="mt-4">
                    <dt className="text-xs text-on-surface-variant mb-1">Observações do solicitante</dt>
                    <dd className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{item.observacoes}</dd>
                  </div>
                )}
              </div>
            </div>

            {/* Right — admin edit panel */}
            <div className="space-y-6">
              <form onSubmit={handleSave} className="bg-surface-low border border-surface-high rounded-xl p-6 space-y-5">
                <h2 className="font-sora text-sm font-semibold text-on-surface pb-2 border-b border-surface-high">Controle administrativo</h2>

                <div>
                  <label className="block text-xs text-on-surface-variant mb-1.5">Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={inputClass}>
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant mb-1.5">Prioridade</label>
                  <select value={editPrioridade} onChange={(e) => setEditPrioridade(e.target.value)} className={inputClass}>
                    {PRIORIDADES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant mb-1.5">Responsável</label>
                  <input
                    type="text"
                    value={editResponsavel}
                    onChange={(e) => setEditResponsavel(e.target.value)}
                    className={inputClass}
                    placeholder="Nome do responsável"
                  />
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant mb-1.5">Observações internas</label>
                  <textarea
                    rows={5}
                    value={editObsInternas}
                    onChange={(e) => setEditObsInternas(e.target.value)}
                    className={`${inputClass} resize-none`}
                    placeholder="Anotações internas, próximos passos..."
                  />
                </div>

                {saveStatus === "error" && (
                  <p className="text-error text-xs">Erro ao salvar. Tente novamente.</p>
                )}
                {saveStatus === "success" && (
                  <p className="text-emerald-400 text-xs">Salvo com sucesso.</p>
                )}

                <button
                  type="submit"
                  disabled={saveStatus === "loading"}
                  className="w-full py-3 bg-primary text-primary-on font-semibold rounded-lg hover:bg-primary-dim transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {saveStatus === "loading" ? "Salvando..." : "Salvar alterações"}
                </button>
              </form>

              {/* Meta info */}
              <div className="bg-surface-low border border-surface-high rounded-xl p-5 space-y-3 text-xs text-on-surface-variant">
                <p><span className="text-on-surface">ID:</span> {item.id}</p>
                <p><span className="text-on-surface">Criado:</span> {formatDate(item.created_at)}</p>
                <p><span className="text-on-surface">Atualizado:</span> {formatDate(item.updated_at)}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
