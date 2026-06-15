"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { StatusBadge, formatDate } from "@/components/StatusBadge";

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  system_id: string | null;
  system_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages_count: number;
  attachments_count: number;
}

interface SupportSystem {
  id: string;
  name: string;
  active: boolean;
}

interface ApiResponse<T> { ok: boolean; data?: T; error?: string; }

const MAX_ATTACHMENT_SIZE_BYTES = 3 * 1024 * 1024;
const MAX_ATTACHMENTS = 3;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [systems, setSystems] = useState<SupportSystem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(
    () => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [selectedFiles],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  async function parse<T>(response: Response) {
    const payload = (await response.json()) as ApiResponse<T>;
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Não foi possível carregar os dados.");
    }
    return payload.data as T;
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsData, systemsData] = await Promise.all([
        fetch("/api/support/tickets", { cache: "no-store" }).then((response) => parse<{ tickets: Ticket[] }>(response)),
        fetch("/api/support/systems", { cache: "no-store" }).then((response) => parse<{ systems: SupportSystem[] }>(response)),
      ]);

      setTickets(ticketsData.tickets || []);
      setSystems(systemsData.systems || []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData().catch(() => {
      setLoading(false);
      setError("Não foi possível carregar os tickets.");
    });
  }, [loadData]);

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    const nextFiles = [...selectedFiles, ...files].slice(0, MAX_ATTACHMENTS);
    const invalidType = nextFiles.find((file) => !ACCEPTED_IMAGE_TYPES.includes(file.type));
    const invalidSize = nextFiles.find((file) => file.size > MAX_ATTACHMENT_SIZE_BYTES);

    if (invalidType) {
      setError("Envie apenas imagens PNG, JPG, JPEG ou WEBP.");
      event.target.value = "";
      return;
    }

    if (invalidSize) {
      setError("Cada imagem deve ter no máximo 3 MB.");
      event.target.value = "";
      return;
    }

    if (selectedFiles.length + files.length > MAX_ATTACHMENTS) {
      setError(`Envie no máximo ${MAX_ATTACHMENTS} imagens por ticket.`);
    } else {
      setError(null);
    }

    setSelectedFiles(nextFiles);
    event.target.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    form.delete("attachments");
    selectedFiles.forEach((file) => form.append("attachments", file));

    const response = await fetch("/api/support/tickets", {
      method: "POST",
      body: form,
    });
    const payload = (await response.json()) as ApiResponse<{ id: string }>;

    setSaving(false);

    if (!response.ok || !payload.ok || !payload.data?.id) {
      setError(payload.error || "Não foi possível criar o ticket.");
      return;
    }

    window.location.href = `/suporte/tickets/${payload.data.id}`;
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">Central de suporte</p>
          <h1 className="font-sora text-3xl font-bold">Meus tickets</h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            Abra chamados, acompanhe respostas e mantenha o histórico de atendimento organizado em um só lugar.
          </p>
        </div>
        <Link
          href="/suporte/ia"
          className="rounded-lg border border-primary/40 px-4 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/10"
        >
          Tirar dúvida com IA
        </Link>
      </div>

      {error && <div className="mb-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</div>}

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-surface-high bg-surface-low p-6">
          <h2 className="font-sora text-xl font-semibold">Abrir novo ticket</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Descreva sua dúvida ou problema com o máximo de detalhes possível. Anexe prints da tela de erro quando necessário.
          </p>

          <form className="mt-6 space-y-4" onSubmit={createTicket}>
            <label className="block text-sm font-medium text-on-surface-variant">
              Título *
              <input
                className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                name="title"
                required
                minLength={4}
                placeholder="Ex.: Não consigo acessar minha conta"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-on-surface-variant">
                Categoria
                <input
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  name="category"
                  placeholder="Acesso, cobrança, implantação..."
                />
              </label>

              <label className="block text-sm font-medium text-on-surface-variant">
                Sistema *
                <select
                  className="mt-1.5 w-full rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  key={systems[0]?.id || "system-select"}
                  name="systemId"
                  required
                  defaultValue={systems[0]?.id || ""}
                >
                  {systems.length === 0 ? (
                    <option value="">Nenhum sistema ativo</option>
                  ) : (
                    systems.map((system) => (
                      <option key={system.id} value={system.id}>{system.name}</option>
                    ))
                  )}
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-on-surface-variant">
              Descrição *
              <textarea
                className="mt-1.5 min-h-36 w-full resize-none rounded-lg border border-surface-highest bg-background px-4 py-3 text-on-surface outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                name="description"
                required
                minLength={10}
                placeholder="Explique o que aconteceu, qual tela estava usando e o resultado esperado."
              />
            </label>

            <div className="rounded-xl border border-dashed border-surface-highest bg-background p-4">
              <label className="block text-sm font-medium text-on-surface-variant">
                Imagens do erro
                <input
                  className="mt-2 block w-full text-sm text-on-surface-variant file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-on hover:file:bg-primary-dim"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleFiles}
                />
              </label>
              <p className="mt-2 text-xs text-on-surface-variant">
                PNG, JPG, JPEG ou WEBP. Até {MAX_ATTACHMENTS} imagens de 3 MB cada.
              </p>

              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {previews.map((preview, index) => (
                    <div key={`${preview.file.name}-${index}`} className="rounded-xl border border-surface-high bg-surface-low p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview.url} alt={preview.file.name} className="h-24 w-full rounded-lg object-cover" />
                      <p className="mt-2 truncate text-xs text-on-surface-variant">{preview.file.name}</p>
                      <button
                        type="button"
                        className="mt-2 w-full rounded-lg border border-error/30 px-2 py-1 text-xs font-semibold text-error transition hover:bg-error/10"
                        onClick={() => removeFile(index)}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-on glow transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving || systems.length === 0}
              type="submit"
            >
              {saving ? "Criando ticket..." : "Criar ticket"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-surface-high bg-surface-low p-6">
          <h2 className="font-sora text-xl font-semibold">Histórico</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Usuários padrão visualizam somente os próprios tickets.</p>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="rounded-xl border border-surface-high bg-background p-4 text-sm text-on-surface-variant">Carregando tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="rounded-xl border border-surface-high bg-background p-4 text-sm text-on-surface-variant">Nenhum ticket criado até o momento.</p>
            ) : (
              tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/suporte/tickets/${ticket.id}`}
                  className="block rounded-xl border border-surface-high bg-background p-4 transition hover:border-primary/40"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-sora font-semibold text-on-surface">{ticket.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{ticket.description}</p>
                    </div>
                    <StatusBadge value={ticket.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                    <span className="rounded-full bg-surface-high px-2.5 py-1">Sistema: {ticket.system_name || "Não informado"}</span>
                    <span className="rounded-full bg-surface-high px-2.5 py-1">{ticket.category}</span>
                    <span className="rounded-full bg-surface-high px-2.5 py-1">{ticket.messages_count} mensagem(ns)</span>
                    <span className="rounded-full bg-surface-high px-2.5 py-1">{ticket.attachments_count} anexo(s)</span>
                    <span className="rounded-full bg-surface-high px-2.5 py-1">Atualizado em {formatDate(ticket.updated_at)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
