"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-surface-high">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-sora font-bold text-xl text-gradient">
              SelectSaaS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#solucoes"
              className="text-on-surface-variant hover:text-primary transition-colors text-sm"
            >
              Soluções
            </Link>
            <Link
              href="#como-funciona"
              className="text-on-surface-variant hover:text-primary transition-colors text-sm"
            >
              Como Funciona
            </Link>
            <Link
              href="#segmentos"
              className="text-on-surface-variant hover:text-primary transition-colors text-sm"
            >
              Segmentos
            </Link>
            <Link
              href="#contato"
              className="text-on-surface-variant hover:text-primary transition-colors text-sm"
            >
              Contato
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-on-surface-variant border border-surface-highest rounded-lg hover:border-primary/40 hover:text-primary transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/suporte"
              className="px-4 py-2 text-sm font-medium text-primary border border-primary/40 rounded-lg hover:bg-primary/10 transition-colors"
            >
              Suporte
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-high transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-surface-low border-b border-surface-high">
          <div className="px-4 py-4 space-y-3">
            {[
              { href: "#solucoes", label: "Soluções" },
              { href: "#como-funciona", label: "Como Funciona" },
              { href: "#segmentos", label: "Segmentos" },
              { href: "#contato", label: "Contato" },
              { href: "/login", label: "Entrar" },
              { href: "/suporte", label: "Suporte" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-on-surface-variant hover:text-primary transition-colors py-2 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
