import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireRequestUser } from "@/lib/auth";
import { jsonError, toErrorResponse } from "@/lib/api-response";

interface AttachmentRow {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  data_base64: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } },
) {
  try {
    const user = await requireRequestUser(request);
    const ticketRows = user.role === "admin"
      ? await sql<{ id: string }[]>`
        SELECT id FROM support_tickets WHERE id = ${params.id}::uuid LIMIT 1
      `
      : await sql<{ id: string }[]>`
        SELECT id FROM support_tickets
        WHERE id = ${params.id}::uuid AND user_id = ${user.id}::uuid
        LIMIT 1
      `;

    if (!ticketRows[0]) {
      return jsonError("Anexo não encontrado ou sem permissão de acesso.", 404);
    }

    const rows = await sql<AttachmentRow[]>`
      SELECT id, file_name, mime_type, size_bytes, data_base64
      FROM support_ticket_attachments
      WHERE id = ${params.attachmentId}::uuid AND ticket_id = ${params.id}::uuid
      LIMIT 1
    `;

    const attachment = rows[0];

    if (!attachment) {
      return jsonError("Anexo não encontrado.", 404);
    }

    const data = Buffer.from(attachment.data_base64, "base64");

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": attachment.mime_type,
        "Content-Length": String(attachment.size_bytes),
        "Content-Disposition": `inline; filename="${attachment.file_name.replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
