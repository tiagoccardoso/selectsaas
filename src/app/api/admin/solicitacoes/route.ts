import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const prioridade = searchParams.get("prioridade") || "";

    const sql = getDb();
    let rows;

    if (status && prioridade) {
      rows = await sql`
        SELECT id, nome_completo, nome_empresa, email, telefone,
               segmento, status, prioridade, responsavel, created_at, updated_at
        FROM saas_requests
        WHERE status = ${status} AND prioridade = ${prioridade}
        ORDER BY created_at DESC
      `;
    } else if (status) {
      rows = await sql`
        SELECT id, nome_completo, nome_empresa, email, telefone,
               segmento, status, prioridade, responsavel, created_at, updated_at
        FROM saas_requests
        WHERE status = ${status}
        ORDER BY created_at DESC
      `;
    } else if (prioridade) {
      rows = await sql`
        SELECT id, nome_completo, nome_empresa, email, telefone,
               segmento, status, prioridade, responsavel, created_at, updated_at
        FROM saas_requests
        WHERE prioridade = ${prioridade}
        ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT id, nome_completo, nome_empresa, email, telefone,
               segmento, status, prioridade, responsavel, created_at, updated_at
        FROM saas_requests
        ORDER BY created_at DESC
      `;
    }

    return NextResponse.json({ solicitacoes: rows });
  } catch (err) {
    console.error("[api/admin/solicitacoes] GET error:", (err as Error).message);
    return NextResponse.json(
      { error: "Erro ao carregar solicitações" },
      { status: 500 }
    );
  }
}
