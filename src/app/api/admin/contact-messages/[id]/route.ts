import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { jsonOk, toErrorResponse } from "@/lib/api-response";
import { pickEnum } from "@/lib/validators";

const statuses = ["new", "read", "in_progress", "resolved"] as const;

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser(request);
    const body = await request.json();
    const status = pickEnum(body.status, statuses, "read");

    await sql`
      UPDATE contact_messages
      SET status = ${status}::contact_message_status
      WHERE id = ${params.id}::uuid
    `;

    return jsonOk({ updated: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
