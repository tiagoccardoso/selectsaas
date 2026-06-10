import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { pickEnum } from "@/lib/validators";

const roles = ["admin", "user"] as const;

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAdminUser(request);
    const body = await request.json();
    const role = pickEnum(body.role, roles, "user");

    if (currentUser.id === params.id && role !== "admin") {
      return jsonError("Você não pode remover o próprio acesso administrativo.", 400);
    }

    await sql`
      UPDATE app_users
      SET role = ${role}::app_user_role
      WHERE id = ${params.id}::uuid
    `;

    return jsonOk({ updated: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
