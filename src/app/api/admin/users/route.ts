import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { jsonOk, toErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);

    const users = await sql`
      SELECT
        u.id, u.name, u.email, u.role, u.is_active, u.created_at, u.updated_at,
        COUNT(t.id)::int AS tickets_count
      FROM app_users u
      LEFT JOIN support_tickets t ON t.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT 200
    `;

    return jsonOk({ users });
  } catch (error) {
    return toErrorResponse(error);
  }
}
