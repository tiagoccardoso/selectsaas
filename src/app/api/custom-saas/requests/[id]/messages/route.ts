import { NextRequest } from "next/server";
import { requireRequestUser } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { sql } from "@/lib/db";
import { requireText } from "@/lib/validators";

interface RequestAccessRow {
  id: string;
  user_id: string;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRequestUser(request);
    const rows = user.role === "admin"
      ? await sql<RequestAccessRow[]>`SELECT id, user_id FROM custom_saas_requests WHERE id = ${params.id}::uuid LIMIT 1`
      : await sql<RequestAccessRow[]>`SELECT id, user_id FROM custom_saas_requests WHERE id = ${params.id}::uuid AND user_id = ${user.id}::uuid LIMIT 1`;

    if (!rows[0]) {
      return jsonError("Solicitação não encontrada ou sem permissão de acesso.", 404);
    }

    const body = await request.json();
    const message = requireText(body.message, "Mensagem", 1, 5000);

    await sql`
      INSERT INTO custom_saas_request_messages (request_id, user_id, author_type, message)
      VALUES (${params.id}::uuid, ${user.id}::uuid, ${user.role}::support_message_author_type, ${message})
    `;

    await sql`
      UPDATE custom_saas_requests
      SET current_stage = current_stage
      WHERE id = ${params.id}::uuid
    `;

    return jsonOk({ created: true }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
