const ticketStatus: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  answered: "Respondido",
  resolved: "Resolvido",
  closed: "Fechado",
};

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

const contactStatus: Record<string, string> = {
  new: "Nova",
  read: "Lida",
  in_progress: "Em atendimento",
  resolved: "Resolvida",
};

export function StatusBadge({ value, type = "ticket" }: { value: string; type?: "ticket" | "priority" | "contact" }) {
  const label = type === "priority" ? priorityLabels[value] : type === "contact" ? contactStatus[value] : ticketStatus[value];

  return (
    <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
      {label || value}
    </span>
  );
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
