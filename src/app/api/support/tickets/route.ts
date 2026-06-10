import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireRequestUser } from "@/lib/auth";
import { jsonOk, toErrorResponse } from "@/lib/api-response";
import { cleanText, pickEnum, requireText } from "@/lib/validators";

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
  messages_count: number;
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
          t.id, t.title, t.description, t.category, t.priority, t.status,
          t.created_at, t.updated_at, t.closed_at, t.user_id,
          u.name AS user_name, u.email AS user_email,
          COUNT(m.id)::int AS messages_count
        FROM support_tickets t
        INNER JOIN app_users u ON u.id = t.user_id
        LEFT JOIN support_ticket_messages m ON m.ticket_id = t.id
        WHERE (${status || null}::text IS NULL OR t.status::text = ${status || null})
        GROUP BY t.id, u.name, u.email
        ORDER BY t.updated_at DESC
      `
      : await sql<TicketRow[]>`
        SELECT
          t.id, t.title, t.description, t.category, t.priority, t.status,
          t.created_at, t.updated_at, t.closed_at, t.user_id,
          u.name AS user_name, u.email AS user_email,
          COUNT(m.id)::int AS messages_count
        FROM support_tickets t
        INNER JOIN app_users u ON u.id = t.user_id
        LEFT JOIN support_ticket_messages m ON m.ticket_id = t.id
        WHERE t.user_id = ${user.id}::uuid
          AND (${status || null}::text IS NULL OR t.status::text = ${status || null})
        GROUP BY t.id, u.name, u.email
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
    const body = await request.json();
    const title = requireText(body.title, "Título", 4, 180);
    const description = requireText(body.description, "Descrição", 10, 5000);
    const category = cleanText(body.category, 80) || "Geral";
    const priority = pickEnum(body.priority, priorities, "medium");

    const tickets = await sql<{ id: string }[]>`
      INSERT INTO support_tickets (user_id, title, description, category, priority)
      VALUES (${user.id}::uuid, ${title}, ${description}, ${category}, ${priority}::support_ticket_priority)
      RETURNING id
    `;

    await sql`
      INSERT INTO support_ticket_messages (ticket_id, user_id, author_type, message)
      VALUES (${tickets[0].id}::uuid, ${user.id}::uuid, ${user.role}::support_message_author_type, ${description})
    `;

    return jsonOk({ id: tickets[0].id }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
