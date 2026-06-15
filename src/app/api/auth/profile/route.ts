import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireRequestUser } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { isValidEmail, normalizeEmail, requireText } from "@/lib/validators";

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);

    const rows = await sql<ProfileRow[]>`
      SELECT id, name, email, role, created_at, updated_at
      FROM app_users
      WHERE id = ${user.id}::uuid AND is_active = true
      LIMIT 1
    `;

    if (!rows[0]) {
      return jsonError("Perfil não encontrado.", 404);
    }

    return jsonOk({ profile: rows[0] });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const body = await request.json();
    const name = requireText(body.name, "Nome", 2, 120);
    const email = normalizeEmail(requireText(body.email, "E-mail", 5, 180));

    if (!isValidEmail(email)) {
      return jsonError("Informe um e-mail válido.", 400);
    }


    const existing = await sql<{ id: string }[]>`
      SELECT id
      FROM app_users
      WHERE email = ${email} AND id <> ${user.id}::uuid
      LIMIT 1
    `;

    if (existing[0]) {
      return jsonError("Já existe outro usuário com este e-mail.", 409);
    }

    const rows = await sql<ProfileRow[]>`
      UPDATE app_users
      SET name = ${name}, email = ${email}
      WHERE id = ${user.id}::uuid AND is_active = true
      RETURNING id, name, email, role, created_at, updated_at
    `;

    if (!rows[0]) {
      return jsonError("Perfil não encontrado.", 404);
    }

    return jsonOk({ profile: rows[0] });
  } catch (error) {
    return toErrorResponse(error);
  }
}
