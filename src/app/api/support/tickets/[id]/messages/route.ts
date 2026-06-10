import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireRequestUser } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { requireText } from "@/lib/validators";

interface TicketRow { id: string; user_id: string; }

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRequestUser(request);
    const rows = user.role === "admin"
      ? await sql<TicketRow[]>`SELECT id, user_id FROM support_tickets WHERE id = ${params.id}::uuid LIMIT 1`
      : await sql<TicketRow[]>`SELECT id, user_id FROM support_tickets WHERE id = ${params.id}::uuid AND user_id = ${user.id}::uuid LIMIT 1`;

    if (!rows[0]) {
      return jsonError("Ticket não encontrado ou sem permissão de acesso.", 404);
    }

    const body = await request.json();
    const message = requireText(body.message, "Mensagem", 1, 5000);
    const statusAfterMessage = user.role === "admin" ? "answered" : "open";

    await sql`
      INSERT INTO support_ticket_messages (ticket_id, user_id, author_type, message)
      VALUES (${params.id}::uuid, ${user.id}::uuid, ${user.role}::support_message_author_type, ${message})
    `;

    await sql`
      UPDATE support_tickets
      SET status = ${statusAfterMessage}::support_ticket_status,
          closed_at = NULL
      WHERE id = ${params.id}::uuid
    `;

    return jsonOk({ created: true }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
