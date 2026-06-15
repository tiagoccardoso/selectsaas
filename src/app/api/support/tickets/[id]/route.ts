import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireRequestUser } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { cleanText, pickEnum } from "@/lib/validators";

const statuses = ["open", "in_progress", "answered", "resolved", "closed"] as const;

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
}

interface MessageRow {
  id: string;
  ticket_id: string;
  user_id: string | null;
  author_type: string;
  author_name: string | null;
  message: string;
  created_at: string;
}

interface AttachmentRow {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function canAccessTicket(ticketId: string, userId: string, isAdmin: boolean) {
  const rows = isAdmin
    ? await sql<TicketRow[]>`
      SELECT
        t.id, t.title, t.description, t.category, t.priority,
        t.system_id::text AS system_id,
        COALESCE(t.system_name, s.name, 'Sistema não informado') AS system_name,
        t.status, t.created_at, t.updated_at, t.closed_at, t.user_id,
        u.name AS user_name, u.email AS user_email
      FROM support_tickets t
      INNER JOIN app_users u ON u.id = t.user_id
      LEFT JOIN support_ticket_systems s ON s.id = t.system_id
      WHERE t.id = ${ticketId}::uuid
      LIMIT 1
    `
    : await sql<TicketRow[]>`
      SELECT
        t.id, t.title, t.description, t.category, t.priority,
        t.system_id::text AS system_id,
        COALESCE(t.system_name, s.name, 'Sistema não informado') AS system_name,
        t.status, t.created_at, t.updated_at, t.closed_at, t.user_id,
        u.name AS user_name, u.email AS user_email
      FROM support_tickets t
      INNER JOIN app_users u ON u.id = t.user_id
      LEFT JOIN support_ticket_systems s ON s.id = t.system_id
      WHERE t.id = ${ticketId}::uuid AND t.user_id = ${userId}::uuid
      LIMIT 1
    `;

  return rows[0] ?? null;
}

async function resolveSystem(systemId: unknown) {
  const rawSystemId = cleanText(systemId, 80);

  if (!rawSystemId || !isUuid(rawSystemId)) {
    return null;
  }

  const rows = await sql<{ id: string; name: string }[]>`
    SELECT id, name
    FROM support_ticket_systems
    WHERE id = ${rawSystemId}::uuid
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRequestUser(request);
    const ticket = await canAccessTicket(params.id, user.id, user.role === "admin");

    if (!ticket) {
      return jsonError("Ticket não encontrado ou sem permissão de acesso.", 404);
    }

    const messages = await sql<MessageRow[]>`
      SELECT
        m.id, m.ticket_id, m.user_id, m.author_type, m.message, m.created_at,
        u.name AS author_name
      FROM support_ticket_messages m
      LEFT JOIN app_users u ON u.id = m.user_id
      WHERE m.ticket_id = ${params.id}::uuid
      ORDER BY m.created_at ASC
    `;

    const attachments = await sql<AttachmentRow[]>`
      SELECT id, file_name, mime_type, size_bytes, created_at
      FROM support_ticket_attachments
      WHERE ticket_id = ${params.id}::uuid
      ORDER BY created_at ASC
    `;

    return jsonOk({
      ticket,
      messages,
      attachments: attachments.map((attachment) => ({
        ...attachment,
        url: `/api/support/tickets/${params.id}/attachments/${attachment.id}`,
      })),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRequestUser(request);
    const ticket = await canAccessTicket(params.id, user.id, user.role === "admin");

    if (!ticket) {
      return jsonError("Ticket não encontrado ou sem permissão de acesso.", 404);
    }

    const body = await request.json();
    const requestedStatus = pickEnum(body.status, statuses, ticket.status as typeof statuses[number]);
    const closedAt = ["closed", "resolved"].includes(requestedStatus) ? new Date().toISOString() : null;

    if (user.role !== "admin" && !["closed", "resolved"].includes(requestedStatus)) {
      return jsonError("Usuário padrão só pode encerrar ou resolver o próprio ticket.", 403);
    }

    if (user.role === "admin") {
      const requestedSystem = await resolveSystem(body.systemId);
      const systemId = requestedSystem?.id || ticket.system_id;
      const systemName = requestedSystem?.name || ticket.system_name;

      await sql`
        UPDATE support_tickets
        SET
          status = ${requestedStatus}::support_ticket_status,
          system_id = ${systemId}::uuid,
          system_name = ${systemName},
          closed_at = ${closedAt}::timestamptz
        WHERE id = ${params.id}::uuid
      `;
    } else {
      await sql`
        UPDATE support_tickets
        SET
          status = ${requestedStatus}::support_ticket_status,
          closed_at = ${closedAt}::timestamptz
        WHERE id = ${params.id}::uuid
      `;
    }

    return jsonOk({ updated: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
