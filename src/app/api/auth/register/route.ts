import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession, resolveRoleForEmail, setSessionCookie } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { isValidEmail, normalizeEmail, requireText } from "@/lib/validators";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = requireText(body.name, "Nome", 2, 120);
    const email = normalizeEmail(requireText(body.email, "E-mail", 5, 180));
    const password = requireText(body.password, "Senha", 8, 200);

    if (!isValidEmail(email)) {
      return jsonError("Informe um e-mail válido.", 400);
    }

    if (body.confirmPassword !== undefined && String(body.confirmPassword) !== password) {
      return jsonError("As senhas não conferem.", 400);
    }

    const existing = await sql<{ id: string }[]>`
      SELECT id FROM app_users WHERE email = ${email} LIMIT 1
    `;

    if (existing[0]) {
      return jsonError("Já existe um usuário cadastrado com este e-mail.", 409);
    }

    const role = resolveRoleForEmail(email);
    const users = await sql<UserRow[]>`
      INSERT INTO app_users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${hashPassword(password)}, ${role}::app_user_role)
      RETURNING id, name, email, role
    `;

    const token = await createSession(users[0].id);
    await setSessionCookie(token);

    return jsonOk({ user: users[0] }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
