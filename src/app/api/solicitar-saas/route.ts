import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED = [
  "nomeCompleto",
  "nomeEmpresa",
  "email",
  "telefone",
  "segmento",
  "problemasResolver",
  "descricaoIdeia",
] as const;

function sanitize(v: unknown): string | null {
  if (typeof v !== "string") return null;
  return v.slice(0, 5000).trim() || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    for (const field of REQUIRED) {
      if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!EMAIL_REGEX.test(body.email)) {
      return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
    }

    const sql = getDb();

    await sql`
      INSERT INTO saas_requests (
        nome_completo, nome_empresa, email, telefone, cidade_estado,
        segmento, tamanho_empresa, qtd_usuarios, problemas_resolver,
        descricao_ideia, funcionalidades, processos_automatizar, perfis_usuarios,
        precisa_area_admin, precisa_login, precisa_pagamentos, precisa_relatorios,
        precisa_upload, precisa_integracoes, precisa_mobile,
        prazo_desejado, faixa_orcamento, observacoes
      ) VALUES (
        ${sanitize(body.nomeCompleto)},
        ${sanitize(body.nomeEmpresa)},
        ${sanitize(body.email)},
        ${sanitize(body.telefone)},
        ${sanitize(body.cidadeEstado)},
        ${sanitize(body.segmento)},
        ${sanitize(body.tamanhoEmpresa)},
        ${sanitize(body.qtdUsuarios)},
        ${sanitize(body.problemasResolver)},
        ${sanitize(body.descricaoIdeia)},
        ${sanitize(body.funcionalidades)},
        ${sanitize(body.processosAutomatizar)},
        ${sanitize(body.perfisUsuarios)},
        ${sanitize(body.precisaAreaAdmin)},
        ${sanitize(body.precisaLogin)},
        ${sanitize(body.precisaPagamentos)},
        ${sanitize(body.precisaRelatorios)},
        ${sanitize(body.precisaUpload)},
        ${sanitize(body.precisaIntegracoes)},
        ${sanitize(body.precisaMobile)},
        ${sanitize(body.prazoDesejado)},
        ${sanitize(body.faixaOrcamento)},
        ${sanitize(body.observacoes)}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/solicitar-saas] error:", (err as Error).message);
    return NextResponse.json(
      { error: "Erro ao salvar solicitação. Tente novamente." },
      { status: 500 }
    );
  }
}
