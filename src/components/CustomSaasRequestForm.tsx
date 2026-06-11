"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { customSaasFieldSections, type CustomSaasField } from "@/lib/custom-saas";

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const fieldClass = "mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30";

export default function CustomSaasRequestForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/custom-saas/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const payload = (await response.json()) as ApiResponse<{ id: string }>;

    setSaving(false);

    if (!response.ok || !payload.ok || !payload.data?.id) {
      setError(payload.error || "Não foi possível enviar a solicitação.");
      return;
    }

    router.push(`/suporte/solicitacoes-saas/${payload.data.id}`);
  }

  return (
    <form className="space-y-6" onSubmit={submitRequest}>
      {error && (
        <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {customSaasFieldSections.map((section) => (
        <section key={section.title} className="rounded-2xl border border-surface-high bg-surface-low p-6">
          <div className="mb-6">
            <h2 className="font-sora text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm text-on-surface-variant">{section.description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {section.fields.map((field) => (
              <FormField key={field.name} field={field} />
            ))}
          </div>
        </section>
      ))}

      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
        <h3 className="font-sora text-lg font-semibold text-primary">Próximos passos</h3>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Após o envio, a equipe administrativa analisará a ideia, poderá fazer perguntas no histórico da solicitação e enviará um orçamento para aprovação. Você acompanhará tudo pela área segura da plataforma.
        </p>
      </div>

      <button
        className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving}
        type="submit"
      >
        {saving ? "Enviando solicitação..." : "Enviar solicitação de SaaS personalizado"}
      </button>
    </form>
  );
}

function FormField({ field }: { field: CustomSaasField }) {
  const wide = field.type === "textarea" || field.name === "shortDescription" || field.name === "problemSolved" || field.name === "desiredFeatures";

  return (
    <label className={`block text-sm font-medium text-on-surface-variant ${wide ? "md:col-span-2" : ""}`}>
      {field.label}{field.required ? " *" : ""}
      {field.type === "textarea" ? (
        <textarea
          className={`${fieldClass} resize-y`}
          name={field.name}
          required={field.required}
          minLength={field.required ? 10 : undefined}
          rows={field.rows || 3}
          placeholder={field.placeholder}
        />
      ) : field.type === "select" ? (
        <select className={fieldClass} name={field.name} required={field.required} defaultValue="">
          {(field.options || []).map((option) => (
            <option key={option.value || "empty"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={fieldClass}
          name={field.name}
          required={field.required}
          minLength={field.required ? 3 : undefined}
          placeholder={field.placeholder}
        />
      )}
    </label>
  );
}
