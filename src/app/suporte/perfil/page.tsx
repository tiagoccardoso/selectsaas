"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { formatDate } from "@/components/StatusBadge";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  async function loadProfile() {
    setLoading(true);
    const response = await fetch("/api/auth/profile", { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<{ profile: Profile }>;

    setLoading(false);

    if (!response.ok || !payload.ok || !payload.data?.profile) {
      setError(payload.error || "Não foi possível carregar seu perfil.");
      return;
    }

    setProfile(payload.data.profile);
  }

  useEffect(() => {
    loadProfile().catch(() => {
      setLoading(false);
      setError("Não foi possível carregar seu perfil.");
    });
  }, []);

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const payload = (await response.json()) as ApiResponse<{ profile: Profile }>;

    setSaving(false);

    if (!response.ok || !payload.ok || !payload.data?.profile) {
      setError(payload.error || "Não foi possível atualizar seu perfil.");
      return;
    }

    setProfile(payload.data.profile);
    setSuccess("Perfil atualizado com sucesso.");
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    if (payload.newPassword !== payload.confirmPassword) {
      setChangingPassword(false);
      setPasswordError("A nova senha e a confirmação não conferem.");
      return;
    }

    const response = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as ApiResponse<{ message: string }>;

    setChangingPassword(false);

    if (!response.ok || !result.ok) {
      setPasswordError(result.error || "Não foi possível alterar sua senha.");
      return;
    }

    setPasswordSuccess(result.data?.message || "Senha alterada com sucesso.");
    event.currentTarget.reset();
  }

  return (
    <AppShell>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">Meu perfil</p>
        <h1 className="font-sora text-3xl font-bold">Editar perfil</h1>
        <p className="mt-2 max-w-2xl text-on-surface-variant">
          Atualize seus dados de identificação. O perfil de acesso e permissões continuam controlados apenas pela administração.
        </p>
      </div>

      {error && <div className="mb-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</div>}
      {success && <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">{success}</div>}

      {loading ? (
        <div className="rounded-2xl border border-surface-high bg-surface-low p-8 text-on-surface-variant">Carregando perfil...</div>
      ) : !profile ? (
        <div className="rounded-2xl border border-surface-high bg-surface-low p-8 text-on-surface-variant">Perfil não encontrado.</div>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-surface-high bg-surface-low p-6">
            <h2 className="font-sora text-xl font-semibold">Dados da conta</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-on-surface-variant">Tipo de acesso</dt>
                <dd className="font-semibold">{profile.role === "admin" ? "Administrador" : "Usuário padrão"}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Criado em</dt>
                <dd className="font-semibold">{formatDate(profile.created_at)}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Última atualização</dt>
                <dd className="font-semibold">{formatDate(profile.updated_at)}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-6">
            <form className="rounded-2xl border border-surface-high bg-surface-low p-6" onSubmit={updateProfile}>
              <h2 className="font-sora text-xl font-semibold">Editar informações</h2>
              <label className="mt-5 block text-sm font-medium text-on-surface-variant">
                Nome completo *
                <input
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="name"
                  defaultValue={profile.name}
                  required
                  minLength={2}
                />
              </label>
              <label className="mt-4 block text-sm font-medium text-on-surface-variant">
                E-mail *
                <input
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="email"
                  type="email"
                  defaultValue={profile.email}
                  required
                />
              </label>
              <button
                className="mt-5 w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                type="submit"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </form>

            <form className="rounded-2xl border border-surface-high bg-surface-low p-6" onSubmit={changePassword}>
              <h2 className="font-sora text-xl font-semibold">Trocar senha</h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Confirme sua senha atual e informe uma nova senha com no mínimo 8 caracteres.
              </p>

              {passwordError && (
                <div className="mt-5 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">{passwordSuccess}</div>
              )}

              <label className="mt-5 block text-sm font-medium text-on-surface-variant">
                Senha atual *
                <input
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Digite sua senha atual"
                />
              </label>
              <label className="mt-4 block text-sm font-medium text-on-surface-variant">
                Nova senha *
                <input
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  maxLength={200}
                  autoComplete="new-password"
                  placeholder="Mínimo de 8 caracteres"
                />
              </label>
              <label className="mt-4 block text-sm font-medium text-on-surface-variant">
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
                className="mt-5 w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
                disabled={changingPassword}
                type="submit"
              >
                {changingPassword ? "Alterando..." : "Alterar senha"}
              </button>
            </form>
          </div>
        </section>
      )}
    </AppShell>
  );
}
