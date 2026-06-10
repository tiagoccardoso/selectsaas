import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireRequestUser } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { pickEnum } from "@/lib/validators";

const statuses = ["open", "in_progress", "answered", "resolved", "closed"] as const;
const priorities = ["low", "medium", "high", "urgent"] as const;

interface TicketRow {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
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

async function canAccessTicket(ticketId: string, userId: string, isAdmin: boolean) {
  const rows = isAdmin
    ? await sql<TicketRow[]>`
      SELECT t.*, u.name AS user_name, u.email AS user_email
      FROM support_tickets t
      INNER JOIN app_users u ON u.id = t.user_id
      WHERE t.id = ${ticketId}::uuid
      LIMIT 1
    `
    : await sql<TicketRow[]>`
      SELECT t.*, u.name AS user_name, u.email AS user_email
      FROM support_tickets t
      INNER JOIN app_users u ON u.id = t.user_id
      WHERE t.id = ${ticketId}::uuid AND t.user_id = ${userId}::uuid
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

    return jsonOk({ ticket, messages });
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
    const requestedPriority = pickEnum(body.priority, priorities, ticket.priority as typeof priorities[number]);

    if (user.role !== "admin" && !["closed", "resolved"].includes(requestedStatus)) {
      return jsonError("Usuário padrão só pode encerrar ou resolver o próprio ticket.", 403);
    }

    const closedAt = ["closed", "resolved"].includes(requestedStatus) ? new Date().toISOString() : null;

    await sql`
      UPDATE support_tickets
      SET
        status = ${requestedStatus}::support_ticket_status,
        priority = ${requestedPriority}::support_ticket_priority,
        closed_at = ${closedAt}::timestamptz
      WHERE id = ${params.id}::uuid
    `;

    return jsonOk({ updated: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
