"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export default function PasswordRecoveryPage() {
  return (
    <Suspense fallback={<PasswordRecoveryFallback />}>
      <PasswordRecoveryForm />
    </Suspense>
  );
}

function PasswordRecoveryFallback() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-on-surface">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center">
        <div className="rounded-2xl border border-surface-high bg-surface-low p-8 text-sm text-on-surface-variant">
          Carregando recuperação de senha...
        </div>
      </div>
    </main>
  );
}

function PasswordRecoveryForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const payload = (await response.json()) as ApiResponse<{ message: string }>;

    setLoading(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error || "Não foi possível solicitar a recuperação de senha.");
      return;
    }

    setSuccess(payload.data?.message || "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.");
    event.currentTarget.reset();
  }

  async function confirmReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(form.entries()), token }),
    });
    const payload = (await response.json()) as ApiResponse<{ message: string }>;

    setLoading(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error || "Não foi possível redefinir sua senha.");
      return;
    }

    setSuccess(payload.data?.message || "Senha redefinida com sucesso.");
    event.currentTarget.reset();
  }

  const isResetMode = Boolean(token);

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-on-surface">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center">
        <section className="w-full max-w-xl overflow-hidden rounded-2xl border border-surface-high bg-surface-low p-6 shadow-2xl sm:p-10">
          <Link href="/" className="font-sora text-2xl font-bold text-gradient">
            SelectSaaS
          </Link>

          <div className="mt-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">Acesso seguro</p>
            <h1 className="font-sora text-3xl font-bold">
              {isResetMode ? "Criar nova senha" : "Recuperar senha"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {isResetMode
                ? "Informe uma nova senha para concluir a recuperação da sua conta."
                : "Informe o e-mail cadastrado. Se existir uma conta ativa, enviaremos um link temporário para redefinição."}
            </p>
          </div>

          {error && <div className="mt-6 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}
          {success && <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{success}</div>}

          {isResetMode ? (
            <form className="mt-6 space-y-4" onSubmit={confirmReset}>
              <label className="block text-sm font-medium text-on-surface-variant">
                Nova senha *
                <input
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={200}
                  autoComplete="new-password"
                  placeholder="Mínimo de 8 caracteres"
                />
              </label>
              <label className="block text-sm font-medium text-on-surface-variant">
                Confirmar nova senha *
                <input
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  maxLength={200}
                  autoComplete="new-password"
                  placeholder="Repita a nova senha"
                />
              </label>
              <button
                className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? "Redefinindo..." : "Redefinir senha"}
              </button>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={requestReset}>
              <label className="block text-sm font-medium text-on-surface-variant">
                E-mail cadastrado *
                <input
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                />
              </label>
              <button
                className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? "Enviando..." : "Enviar instruções"}
              </button>
            </form>
          )}

          <div className="mt-6 flex flex-col gap-2 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
            <Link href="/login" className="font-semibold text-primary transition hover:text-primary-dim">
              Voltar para o login
            </Link>
            <span>O link de redefinição expira em 1 hora.</span>
          </div>
        </section>
      </div>
    </main>
  );
}
