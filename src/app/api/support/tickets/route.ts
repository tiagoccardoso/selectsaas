import { Buffer } from "node:buffer";
import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireRequestUser } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { cleanText, requireText } from "@/lib/validators";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
const MAX_ATTACHMENT_SIZE_BYTES = 3 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_TICKET = 3;

interface TicketRow {
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
  closed_at: string | null;
  user_id: string;
  user_name: string;
  user_email: string;
  messages_count: number;
  attachments_count: number;
}

interface ParsedTicketRequest {
  title: string;
  description: string;
  category: string;
  systemId: string | null;
  attachments: File[];
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function parseCreateRequest(request: NextRequest): Promise<ParsedTicketRequest> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const attachments = form
      .getAll("attachments")
      .filter((value): value is File => value instanceof File && value.size > 0);

    return {
      title: requireText(form.get("title"), "Título", 4, 180),
      description: requireText(form.get("description"), "Descrição", 10, 5000),
      category: cleanText(form.get("category"), 80) || "Geral",
      systemId: cleanText(form.get("systemId"), 80) || null,
      attachments,
    };
  }

  const body = await request.json();
  return {
    title: requireText(body.title, "Título", 4, 180),
    description: requireText(body.description, "Descrição", 10, 5000),
    category: cleanText(body.category, 80) || "Geral",
    systemId: cleanText(body.systemId, 80) || null,
    attachments: [],
  };
}

async function resolveSystem(systemId: string | null) {
  const requestedSystemId = systemId && isUuid(systemId) ? systemId : null;

  const requestedRows = requestedSystemId
    ? await sql<{ id: string; name: string }[]>`
      SELECT id, name
      FROM support_ticket_systems
      WHERE id = ${requestedSystemId}::uuid AND active = true
      LIMIT 1
    `
    : [];

  if (requestedRows[0]) {
    return requestedRows[0];
  }

  const fallbackRows = await sql<{ id: string; name: string }[]>`
    SELECT id, name
    FROM support_ticket_systems
    WHERE active = true
    ORDER BY CASE WHEN name = 'SmileHub' THEN 0 ELSE 1 END, sort_order ASC, name ASC
    LIMIT 1
  `;

  return fallbackRows[0] ?? null;
}

async function validateAttachments(attachments: File[]) {
  if (attachments.length > MAX_ATTACHMENTS_PER_TICKET) {
    return `Envie no máximo ${MAX_ATTACHMENTS_PER_TICKET} imagens por ticket.`;
  }

  for (const attachment of attachments) {
    if (!ALLOWED_IMAGE_TYPES.includes(attachment.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      return "Envie apenas imagens PNG, JPG, JPEG ou WEBP.";
    }

    if (attachment.size > MAX_ATTACHMENT_SIZE_BYTES) {
      return "Cada imagem deve ter no máximo 3 MB.";
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "1" && user.role === "admin";
    const status = cleanText(searchParams.get("status"), 40);

    const rows = all
      ? await sql<TicketRow[]>`
        SELECT
          t.id, t.title, t.description, t.category, t.priority,
          t.system_id::text AS system_id,
          COALESCE(t.system_name, s.name, 'Sistema não informado') AS system_name,
          t.status, t.created_at, t.updated_at, t.closed_at, t.user_id,
          u.name AS user_name, u.email AS user_email,
          COUNT(DISTINCT m.id)::int AS messages_count,
          COUNT(DISTINCT a.id)::int AS attachments_count
        FROM support_tickets t
        INNER JOIN app_users u ON u.id = t.user_id
        LEFT JOIN support_ticket_systems s ON s.id = t.system_id
        LEFT JOIN support_ticket_messages m ON m.ticket_id = t.id
        LEFT JOIN support_ticket_attachments a ON a.ticket_id = t.id
        WHERE (${status || null}::text IS NULL OR t.status::text = ${status || null})
        GROUP BY t.id, u.name, u.email, s.name
        ORDER BY t.updated_at DESC
      `
      : await sql<TicketRow[]>`
        SELECT
          t.id, t.title, t.description, t.category, t.priority,
          t.system_id::text AS system_id,
          COALESCE(t.system_name, s.name, 'Sistema não informado') AS system_name,
          t.status, t.created_at, t.updated_at, t.closed_at, t.user_id,
          u.name AS user_name, u.email AS user_email,
          COUNT(DISTINCT m.id)::int AS messages_count,
          COUNT(DISTINCT a.id)::int AS attachments_count
        FROM support_tickets t
        INNER JOIN app_users u ON u.id = t.user_id
        LEFT JOIN support_ticket_systems s ON s.id = t.system_id
        LEFT JOIN support_ticket_messages m ON m.ticket_id = t.id
        LEFT JOIN support_ticket_attachments a ON a.ticket_id = t.id
        WHERE t.user_id = ${user.id}::uuid
          AND (${status || null}::text IS NULL OR t.status::text = ${status || null})
        GROUP BY t.id, u.name, u.email, s.name
        ORDER BY t.updated_at DESC
      `;

    return jsonOk({ tickets: rows });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const parsed = await parseCreateRequest(request);
    const attachmentError = await validateAttachments(parsed.attachments);

    if (attachmentError) {
      return jsonError(attachmentError, 400);
    }

    const system = await resolveSystem(parsed.systemId);

    if (!system) {
      return jsonError("Nenhum sistema de suporte está ativo para abertura de tickets.", 400);
    }

    const tickets = await sql<{ id: string }[]>`
      INSERT INTO support_tickets (user_id, title, description, category, priority, system_id, system_name)
      VALUES (
        ${user.id}::uuid,
        ${parsed.title},
        ${parsed.description},
        ${parsed.category},
        'medium'::support_ticket_priority,
        ${system.id}::uuid,
        ${system.name}
      )
      RETURNING id
    `;

    await sql`
      INSERT INTO support_ticket_messages (ticket_id, user_id, author_type, message)
      VALUES (${tickets[0].id}::uuid, ${user.id}::uuid, ${user.role}::support_message_author_type, ${parsed.description})
    `;

    for (const attachment of parsed.attachments) {
      const dataBase64 = Buffer.from(await attachment.arrayBuffer()).toString("base64");
      const fileName = cleanText(attachment.name, 180) || "imagem-do-ticket";

      await sql`
        INSERT INTO support_ticket_attachments (ticket_id, uploaded_by, file_name, mime_type, size_bytes, data_base64)
        VALUES (
          ${tickets[0].id}::uuid,
          ${user.id}::uuid,
          ${fileName},
          ${attachment.type},
          ${attachment.size},
          ${dataBase64}
        )
      `;
    }

    return jsonOk({ id: tickets[0].id }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
