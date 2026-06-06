import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const VALID_STATUSES = [
  "novo",
  "em_analise",
  "em_contato",
  "proposta_enviada",
  "em_desenvolvimento",
  "concluido",
  "cancelado",
];
const VALID_PRIORIDADES = ["baixa", "normal", "alta", "urgente"];

function sanitize(v: unknown): string | null {
  if (typeof v !== "string") return null;
  return v.slice(0, 5000).trim() || null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sql = getDb();
    const [row] = await sql`
      SELECT * FROM saas_requests WHERE id = ${params.id}
    `;
    if (!row) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ solicitacao: row });
  } catch (err) {
    console.error("[api/admin/solicitacoes/id] GET error:", (err as Error).message);
    return NextResponse.json({ error: "Erro ao carregar" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, prioridade, observacoesInternas, responsavel } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }
    if (!prioridade || !VALID_PRIORIDADES.includes(prioridade)) {
      return NextResponse.json({ error: "Prioridade inválida" }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      UPDATE saas_requests
      SET
        status               = ${status},
        prioridade           = ${prioridade},
        observacoes_internas = ${sanitize(observacoesInternas)},
        responsavel          = ${sanitize(responsavel)},
        updated_at           = NOW()
      WHERE id = ${params.id}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/solicitacoes/id] PATCH error:", (err as Error).message);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
