"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const navItems = [
  { href: "/suporte", label: "Tickets" },
  { href: "/suporte/ia", label: "IA de suporte" },
  { href: "/suporte/solicitacoes-saas", label: "SaaS personalizado" },
  { href: "/suporte/perfil", label: "Meu perfil" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadUser() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse<{ user: User }>;

      if (!alive) return;

      if (!response.ok || !payload.ok || !payload.data?.user) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      setUser(payload.data.user);
      setLoading(false);
    }

    loadUser().catch(() => router.replace(`/login?next=${encodeURIComponent(pathname)}`));

    return () => {
      alive = false;
    };
  }, [pathname, router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 text-on-surface">
        <div className="mx-auto max-w-4xl rounded-2xl border border-surface-high bg-surface-low p-8 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-on-surface-variant">Carregando sua área segura...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <header className="sticky top-0 z-40 border-b border-surface-high bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link href="/" className="font-sora text-xl font-bold text-gradient">
              SelectSaaS
            </Link>
            <p className="text-xs text-on-surface-variant">
              Área segura de suporte, IA e SaaS personalizado
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-high hover:text-primary"
              prefetch={false}
            >
              Marketplace
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-primary text-primary-on"
                    : "text-on-surface-variant hover:bg-surface-high hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-secondary text-background"
                    : "text-on-surface-variant hover:bg-surface-high hover:text-secondary"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-surface-high bg-surface-low px-3 py-2 lg:min-w-72">
            <div className="min-w-0">
              <Link href="/suporte/perfil" className="truncate text-sm font-semibold transition hover:text-primary">{user?.name}</Link>
              <p className="truncate text-xs text-on-surface-variant">
                {user?.role === "admin" ? "Administrador" : "Usuário padrão"}
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-surface-highest px-3 py-2 text-xs font-semibold text-on-surface-variant transition hover:border-error/40 hover:text-error"
              type="button"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
