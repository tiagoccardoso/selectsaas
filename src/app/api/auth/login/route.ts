import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/auth";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { isValidEmail, normalizeEmail, requireText } from "@/lib/validators";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  password_hash: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = normalizeEmail(requireText(body.email, "E-mail", 5, 180));
    const password = requireText(body.password, "Senha", 1, 200);

    if (!isValidEmail(email)) {
      return jsonError("Informe um e-mail válido.", 400);
    }

    const rows = await sql<UserRow[]>`
      SELECT id, name, email, role, password_hash
      FROM app_users
      WHERE email = ${email}
      LIMIT 1
    `;

    const user = rows[0];

    if (!user || !verifyPassword(password, user.password_hash)) {
      return jsonError("E-mail ou senha inválidos.", 401);
    }

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return jsonOk({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return toErrorResponse(error);
  }
}
