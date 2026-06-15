import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireAdminUser, requireRequestUser } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { requireText } from "@/lib/validators";

interface SupportSystemRow {
  id: string;
  name: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  tickets_count: number;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "1" && user.role === "admin";

    const systems = all
      ? await sql<SupportSystemRow[]>`
        SELECT
          s.id, s.name, s.active, s.sort_order, s.created_at, s.updated_at,
          COUNT(t.id)::int AS tickets_count
        FROM support_ticket_systems s
        LEFT JOIN support_tickets t ON t.system_id = s.id
        GROUP BY s.id
        ORDER BY s.active DESC, s.sort_order ASC, s.name ASC
      `
      : await sql<SupportSystemRow[]>`
        SELECT
          s.id, s.name, s.active, s.sort_order, s.created_at, s.updated_at,
          COUNT(t.id)::int AS tickets_count
        FROM support_ticket_systems s
        LEFT JOIN support_tickets t ON t.system_id = s.id
        WHERE s.active = true
        GROUP BY s.id
        ORDER BY s.sort_order ASC, s.name ASC
      `;

    return jsonOk({ systems });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const body = await request.json();
    const name = requireText(body.name, "Sistema", 2, 80);

    const duplicate = await sql<{ id: string }[]>`
      SELECT id FROM support_ticket_systems WHERE lower(name) = lower(${name}) LIMIT 1
    `;

    if (duplicate[0]) {
      return jsonError("Já existe um sistema cadastrado com este nome.", 409);
    }

    const rows = await sql<{ id: string }[]>`
      INSERT INTO support_ticket_systems (name, active, sort_order)
      VALUES (
        ${name},
        true,
        COALESCE((SELECT MAX(sort_order) + 10 FROM support_ticket_systems), 10)
      )
      RETURNING id
    `;

    return jsonOk({ id: rows[0].id }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
