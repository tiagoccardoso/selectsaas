import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { isValidEmail, normalizeEmail, pickEnum, requireText } from "@/lib/validators";

const roles = ["admin", "user"] as const;

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAdminUser(request);
    const body = await request.json();
    const name = requireText(body.name, "Nome", 2, 120);
    const email = normalizeEmail(requireText(body.email, "E-mail", 5, 180));
    const role = pickEnum(body.role, roles, "user");
    const isActive = body.isActive === undefined ? true : Boolean(body.isActive);

    if (!isValidEmail(email)) {
      return jsonError("Informe um e-mail válido.", 400);
    }

    if (currentUser.id === params.id && (role !== "admin" || !isActive)) {
      return jsonError("Você não pode remover ou desativar o próprio acesso administrativo.", 400);
    }

    const duplicate = await sql<{ id: string }[]>`
      SELECT id
      FROM app_users
      WHERE email = ${email} AND id <> ${params.id}::uuid
      LIMIT 1
    `;

    if (duplicate[0]) {
      return jsonError("Já existe outro usuário cadastrado com este e-mail.", 409);
    }

    const updated = await sql<{ id: string }[]>`
      UPDATE app_users
      SET name = ${name}, email = ${email}, role = ${role}::app_user_role, is_active = ${isActive}
      WHERE id = ${params.id}::uuid
      RETURNING id
    `;

    if (!updated[0]) {
      return jsonError("Usuário não encontrado.", 404);
    }

    if (!isActive) {
      await sql`DELETE FROM app_sessions WHERE user_id = ${params.id}::uuid`;
    }

    return jsonOk({ updated: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAdminUser(request);

    if (currentUser.id === params.id) {
      return jsonError("Você não pode excluir ou desativar o próprio usuário administrador.", 400);
    }

    const updated = await sql<{ id: string }[]>`
      UPDATE app_users
      SET is_active = false
      WHERE id = ${params.id}::uuid
      RETURNING id
    `;

    if (!updated[0]) {
      return jsonError("Usuário não encontrado.", 404);
    }

    await sql`DELETE FROM app_sessions WHERE user_id = ${params.id}::uuid`;

    return jsonOk({ deactivated: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
