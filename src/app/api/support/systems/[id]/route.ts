import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { requireText } from "@/lib/validators";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser(request);
    const body = await request.json();
    const name = requireText(body.name, "Sistema", 2, 80);
    const active = Boolean(body.active);

    const duplicate = await sql<{ id: string }[]>`
      SELECT id
      FROM support_ticket_systems
      WHERE lower(name) = lower(${name}) AND id <> ${params.id}::uuid
      LIMIT 1
    `;

    if (duplicate[0]) {
      return jsonError("Já existe outro sistema cadastrado com este nome.", 409);
    }

    const rows = await sql<{ id: string }[]>`
      UPDATE support_ticket_systems
      SET name = ${name}, active = ${active}
      WHERE id = ${params.id}::uuid
      RETURNING id
    `;

    if (!rows[0]) {
      return jsonError("Sistema não encontrado.", 404);
    }

    await sql`
      UPDATE support_tickets
      SET system_name = ${name}
      WHERE system_id = ${params.id}::uuid
    `;

    return jsonOk({ updated: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser(request);

    const rows = await sql<{ id: string }[]>`
      UPDATE support_ticket_systems
      SET active = false
      WHERE id = ${params.id}::uuid
      RETURNING id
    `;

    if (!rows[0]) {
      return jsonError("Sistema não encontrado.", 404);
    }

    return jsonOk({ deactivated: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
