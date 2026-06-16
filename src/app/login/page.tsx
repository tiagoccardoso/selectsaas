"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-on-surface">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="rounded-2xl border border-surface-high bg-surface-low p-8 text-sm text-on-surface-variant">
          Carregando acesso...
        </div>
      </div>
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/suporte";
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as ApiResponse<{ user: { role: string } }>;

    setLoading(false);

    if (!response.ok || !result.ok) {
      setError(result.error || "Não foi possível concluir a operação.");
      return;
    }

    router.replace(nextPath);
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-on-surface">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-2xl border border-surface-high bg-surface-low shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative hidden overflow-hidden border-r border-surface-high bg-surface p-10 lg:block">
            <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <Link href="/" className="font-sora text-2xl font-bold text-gradient">
                  SelectSaaS
                </Link>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-on-surface-variant">
                  Acesse a central de suporte, acompanhe tickets e use a IA para tirar dúvidas sobre a plataforma.
                </p>
              </div>
              <div className="grid gap-4 text-sm text-on-surface-variant">
                <div className="rounded-xl border border-surface-high bg-background/60 p-4">
                  <strong className="text-primary">Usuário padrão</strong>
                  <p className="mt-1">Cria tickets, acompanha apenas seus chamados e usa a IA de suporte.</p>
                </div>
                <div className="rounded-xl border border-surface-high bg-background/60 p-4">
                  <strong className="text-secondary">Administrador</strong>
                  <p className="mt-1">Gerencia todos os tickets, mensagens de contato, usuários e base de conhecimento.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mb-8">
              <Link href="/" className="mb-6 inline-flex text-sm text-on-surface-variant transition hover:text-primary lg:hidden">
                ← Voltar ao marketplace
              </Link>
              <h1 className="font-sora text-3xl font-bold">
                {mode === "login" ? "Entrar na plataforma" : "Criar conta"}
              </h1>
              <p className="mt-2 text-sm text-on-surface-variant">
                {mode === "login"
                  ? "Entre para acessar tickets, IA e área administrativa conforme seu perfil."
                  : "Novas contas são criadas como usuário padrão, exceto e-mails configurados em ADMIN_EMAILS."}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-xl bg-surface-high p-1 text-sm font-semibold">
              <button
                className={`rounded-lg px-4 py-2 transition ${mode === "login" ? "bg-primary text-primary-on" : "text-on-surface-variant hover:text-primary"}`}
                onClick={() => setMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={`rounded-lg px-4 py-2 transition ${mode === "register" ? "bg-primary text-primary-on" : "text-on-surface-variant hover:text-primary"}`}
                onClick={() => setMode("register")}
                type="button"
              >
                Cadastro
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "register" && (
                <label className="block text-sm font-medium text-on-surface-variant">
                  Nome completo *
                  <input
                    className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                    name="name"
                    required
                    minLength={2}
                    autoComplete="name"
                    placeholder="Seu nome"
                  />
                </label>
              )}

              <label className="block text-sm font-medium text-on-surface-variant">
                E-mail *
                <input
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                />
              </label>

              <label className="block text-sm font-medium text-on-surface-variant">
                Senha *
                <input
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="password"
                  type="password"
                  required
                  minLength={mode === "register" ? 8 : 1}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  placeholder="Sua senha"
                />
              </label>

              {mode === "register" && (
                <label className="block text-sm font-medium text-on-surface-variant">
                  Confirmar senha *
                  <input
                    className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                  />
                </label>
              )}

              {mode === "login" && (
                <div className="text-right text-sm">
                  <Link href="/recuperar-senha" className="font-semibold text-primary transition hover:text-primary-dim">
                    Esqueci minha senha
                  </Link>
                </div>
              )}

              <button
                className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
