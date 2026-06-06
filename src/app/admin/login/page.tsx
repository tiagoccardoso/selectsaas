"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.replace("/admin/solicitacoes");
      } else {
        const data = await res.json();
        setErrorMsg(data.error ?? "Credenciais inválidas");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.");
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-sora font-bold text-2xl text-gradient">
            SelectSaaS
          </span>
          <p className="text-on-surface-variant text-sm mt-2">
            Área administrativa
          </p>
        </div>

        <div className="bg-surface-low border border-surface-high rounded-xl p-8">
          <h1 className="font-sora text-xl font-semibold text-on-surface mb-6">
            Entrar
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-on-surface-variant mb-1.5"
              >
                Senha de administrador
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-surface-highest rounded-lg px-4 py-3 text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {status === "error" && (
              <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-sm">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 bg-primary text-primary-on font-semibold rounded-lg glow hover:bg-primary-dim transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Autenticando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
