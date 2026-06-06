"use client";

import { useState } from "react";

type FormStatus = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full bg-surface border border-surface-highest rounded-lg px-4 py-3 text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors";

const labelClass = "block text-sm font-medium text-on-surface-variant mb-1.5";

const sectionTitle = "font-sora text-base font-semibold text-on-surface mb-4 pb-2 border-b border-surface-high";

export default function SolicitarSaasForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [formData, setFormData] = useState({
    // Contato
    nomeCompleto: "",
    nomeEmpresa: "",
    email: "",
    telefone: "",
    cidadeEstado: "",
    // Negócio
    segmento: "",
    tamanhoEmpresa: "",
    qtdUsuarios: "",
    problemasResolver: "",
    // SaaS desejado
    descricaoIdeia: "",
    funcionalidades: "",
    processosAutomatizar: "",
    perfisUsuarios: "",
    precisaAreaAdmin: "",
    precisaLogin: "",
    precisaPagamentos: "",
    precisaRelatorios: "",
    precisaUpload: "",
    precisaIntegracoes: "",
    precisaMobile: "",
    prazoDesejado: "",
    faixaOrcamento: "",
    observacoes: "",
  });

  const set = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/solicitar-saas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao enviar");
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-10 text-center">
        <span className="text-5xl mb-5 block">✅</span>
        <h3 className="font-sora text-2xl font-semibold text-on-surface mb-3">
          Solicitação recebida!
        </h3>
        <p className="text-on-surface-variant leading-relaxed max-w-md mx-auto">
          Nossa equipe analisará as informações e entrará em contato em breve para
          discutir os próximos passos do seu projeto.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>

      {/* DADOS DE CONTATO */}
      <fieldset>
        <legend className={sectionTitle}>Dados de contato</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nomeCompleto" className={labelClass}>Nome completo *</label>
            <input
              id="nomeCompleto"
              type="text"
              required
              value={formData.nomeCompleto}
              onChange={set("nomeCompleto")}
              className={inputClass}
              placeholder="Seu nome completo"
            />
          </div>
          <div>
            <label htmlFor="nomeEmpresa" className={labelClass}>Nome da empresa *</label>
            <input
              id="nomeEmpresa"
              type="text"
              required
              value={formData.nomeEmpresa}
              onChange={set("nomeEmpresa")}
              className={inputClass}
              placeholder="Razão social ou nome fantasia"
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>E-mail *</label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={set("email")}
              className={inputClass}
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="telefone" className={labelClass}>Telefone / WhatsApp *</label>
            <input
              id="telefone"
              type="tel"
              required
              value={formData.telefone}
              onChange={set("telefone")}
              className={inputClass}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="cidadeEstado" className={labelClass}>Cidade / Estado</label>
            <input
              id="cidadeEstado"
              type="text"
              value={formData.cidadeEstado}
              onChange={set("cidadeEstado")}
              className={inputClass}
              placeholder="Ex: São Paulo / SP"
            />
          </div>
        </div>
      </fieldset>

      {/* SOBRE O NEGÓCIO */}
      <fieldset>
        <legend className={sectionTitle}>Sobre o negócio</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="segmento" className={labelClass}>Segmento de atuação *</label>
            <input
              id="segmento"
              type="text"
              required
              value={formData.segmento}
              onChange={set("segmento")}
              className={inputClass}
              placeholder="Ex: Saúde, Agronegócio, Educação..."
            />
          </div>
          <div>
            <label htmlFor="tamanhoEmpresa" className={labelClass}>Tamanho da empresa</label>
            <select
              id="tamanhoEmpresa"
              value={formData.tamanhoEmpresa}
              onChange={set("tamanhoEmpresa")}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              <option value="mei">MEI / Autônomo</option>
              <option value="micro">Microempresa (até 9 funcionários)</option>
              <option value="pequena">Pequena empresa (10 a 49)</option>
              <option value="media">Média empresa (50 a 249)</option>
              <option value="grande">Grande empresa (250+)</option>
            </select>
          </div>
          <div>
            <label htmlFor="qtdUsuarios" className={labelClass}>Quantidade estimada de usuários</label>
            <select
              id="qtdUsuarios"
              value={formData.qtdUsuarios}
              onChange={set("qtdUsuarios")}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              <option value="1-5">1 a 5 usuários</option>
              <option value="6-20">6 a 20 usuários</option>
              <option value="21-50">21 a 50 usuários</option>
              <option value="51-200">51 a 200 usuários</option>
              <option value="200+">Mais de 200 usuários</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="problemasResolver" className={labelClass}>
            Principais problemas que deseja resolver *
          </label>
          <textarea
            id="problemasResolver"
            required
            rows={3}
            value={formData.problemasResolver}
            onChange={set("problemasResolver")}
            className={`${inputClass} resize-none`}
            placeholder="Descreva os principais desafios ou gargalos que o sistema deve resolver..."
          />
        </div>
      </fieldset>

      {/* SOBRE O SAAS DESEJADO */}
      <fieldset>
        <legend className={sectionTitle}>Sobre o SaaS desejado</legend>
        <div className="space-y-4">
          <div>
            <label htmlFor="descricaoIdeia" className={labelClass}>
              Descrição da ideia do sistema *
            </label>
            <textarea
              id="descricaoIdeia"
              required
              rows={4}
              value={formData.descricaoIdeia}
              onChange={set("descricaoIdeia")}
              className={`${inputClass} resize-none`}
              placeholder="Descreva com suas palavras o que o sistema deve fazer e qual é o objetivo principal..."
            />
          </div>
          <div>
            <label htmlFor="funcionalidades" className={labelClass}>
              Funcionalidades principais desejadas
            </label>
            <textarea
              id="funcionalidades"
              rows={3}
              value={formData.funcionalidades}
              onChange={set("funcionalidades")}
              className={`${inputClass} resize-none`}
              placeholder="Liste as funcionalidades mais importantes. Ex: cadastro de clientes, emissão de relatórios, controle financeiro..."
            />
          </div>
          <div>
            <label htmlFor="processosAutomatizar" className={labelClass}>
              Quais processos devem ser automatizados?
            </label>
            <textarea
              id="processosAutomatizar"
              rows={3}
              value={formData.processosAutomatizar}
              onChange={set("processosAutomatizar")}
              className={`${inputClass} resize-none`}
              placeholder="Ex: envio de e-mails, cobranças recorrentes, notificações automáticas..."
            />
          </div>
          <div>
            <label htmlFor="perfisUsuarios" className={labelClass}>
              Tipos de usuários / perfis do sistema
            </label>
            <input
              id="perfisUsuarios"
              type="text"
              value={formData.perfisUsuarios}
              onChange={set("perfisUsuarios")}
              className={inputClass}
              placeholder="Ex: administrador, operador, cliente, gerente..."
            />
          </div>
        </div>

        {/* Requisitos técnicos */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: "precisaAreaAdmin", label: "Necessita de área administrativa?" },
            { id: "precisaLogin", label: "Necessita de login / autenticação?" },
            { id: "precisaPagamentos", label: "Necessita de pagamentos / assinaturas?" },
            { id: "precisaRelatorios", label: "Necessita de relatórios ou dashboards?" },
            { id: "precisaUpload", label: "Necessita de upload de arquivos / documentos?" },
            { id: "precisaIntegracoes", label: "Necessita de integração com APIs externas?" },
            { id: "precisaMobile", label: "Necessita de versão mobile ou layout responsivo?" },
          ].map(({ id, label }) => (
            <div key={id}>
              <label htmlFor={id} className={labelClass}>{label}</label>
              <select
                id={id}
                value={formData[id as keyof typeof formData]}
                onChange={set(id as keyof typeof formData)}
                className={inputClass}
              >
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
                <option value="talvez">Não sei / Talvez</option>
              </select>
            </div>
          ))}
        </div>
      </fieldset>

      {/* PRAZO E ORÇAMENTO */}
      <fieldset>
        <legend className={sectionTitle}>Prazo e orçamento</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prazoDesejado" className={labelClass}>Prazo desejado para entrega</label>
            <select
              id="prazoDesejado"
              value={formData.prazoDesejado}
              onChange={set("prazoDesejado")}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              <option value="urgente">Urgente (até 1 mês)</option>
              <option value="curto">Curto prazo (1 a 3 meses)</option>
              <option value="medio">Médio prazo (3 a 6 meses)</option>
              <option value="longo">Longo prazo (acima de 6 meses)</option>
              <option value="flexivel">Flexível / A definir</option>
            </select>
          </div>
          <div>
            <label htmlFor="faixaOrcamento" className={labelClass}>Faixa de investimento estimada</label>
            <select
              id="faixaOrcamento"
              value={formData.faixaOrcamento}
              onChange={set("faixaOrcamento")}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              <option value="ate5k">Até R$ 5.000</option>
              <option value="5k-15k">R$ 5.000 a R$ 15.000</option>
              <option value="15k-30k">R$ 15.000 a R$ 30.000</option>
              <option value="30k-50k">R$ 30.000 a R$ 50.000</option>
              <option value="acima50k">Acima de R$ 50.000</option>
              <option value="naosei">Não sei / Quero orientação</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* OBSERVAÇÕES */}
      <fieldset>
        <legend className={sectionTitle}>Observações adicionais</legend>
        <div>
          <label htmlFor="observacoes" className={labelClass}>
            Informações complementares ou dúvidas
          </label>
          <textarea
            id="observacoes"
            rows={4}
            value={formData.observacoes}
            onChange={set("observacoes")}
            className={`${inputClass} resize-none`}
            placeholder="Adicione qualquer informação que considere relevante para nossa análise..."
          />
        </div>
      </fieldset>

      {status === "error" && (
        <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-sm">
          Ocorreu um erro ao enviar a solicitação. Por favor, tente novamente.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 bg-primary text-primary-on font-semibold rounded-lg glow hover:bg-primary-dim transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base"
      >
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando solicitação...
          </span>
        ) : (
          "Enviar solicitação de SaaS personalizado"
        )}
      </button>

      <p className="text-on-surface-variant text-xs text-center">
        Ao enviar, você concorda com nossa política de privacidade.
        Não compartilhamos suas informações com terceiros.
      </p>
    </form>
  );
}
