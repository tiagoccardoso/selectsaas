"use client";

import { useState } from "react";

interface ContactFormProps {
  productName?: string;
  productSlug?: string;
}

export default function ContactForm({ productName, productSlug }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: productName ? `Tenho interesse em contratar o ${productName}.` : "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, productSlug }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-8 text-center">
        <span className="text-4xl mb-4 block">✅</span>
        <h3 className="font-sora text-xl font-semibold text-on-surface mb-2">
          Solicitação enviada!
        </h3>
        <p className="text-on-surface-variant text-sm">
          Nossa equipe entrará em contato em até 24 horas úteis.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-on-surface-variant mb-1.5">
            Nome completo *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-surface-low border border-surface-highest rounded-lg px-4 py-3 text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-on-surface-variant mb-1.5">
            E-mail *
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-surface-low border border-surface-highest rounded-lg px-4 py-3 text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
            placeholder="seu@email.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-on-surface-variant mb-1.5">
            Telefone
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-surface-low border border-surface-highest rounded-lg px-4 py-3 text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
            placeholder="(11) 99999-9999"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-on-surface-variant mb-1.5">
            Empresa
          </label>
          <input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full bg-surface-low border border-surface-highest rounded-lg px-4 py-3 text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
            placeholder="Nome da empresa"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-on-surface-variant mb-1.5">
          Mensagem
        </label>
        <textarea
          id="message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-surface-low border border-surface-highest rounded-lg px-4 py-3 text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
          placeholder="Como podemos ajudar você?"
        />
      </div>

      {status === "error" && (
        <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-sm">
          Ocorreu um erro ao enviar. Tente novamente.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 bg-primary text-primary-on font-semibold rounded-lg glow hover:bg-primary-dim transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </span>
        ) : (
          "Solicitar demonstração gratuita"
        )}
      </button>

      <p className="text-on-surface-variant text-xs text-center">
        Ao enviar, você concorda com nossa política de privacidade. Não enviamos spam.
      </p>
    </form>
  );
}
