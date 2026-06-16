import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireRequestUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { requireText } from "@/lib/validators";

interface UserPasswordRow {
  id: string;
  password_hash: string;
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const body = await request.json();
    const currentPassword = requireText(body.currentPassword, "Senha atual", 1, 200);
    const newPassword = requireText(body.newPassword, "Nova senha", 8, 200);
    const confirmPassword = requireText(body.confirmPassword, "Confirmação da nova senha", 8, 200);

    if (newPassword !== confirmPassword) {
      return jsonError("A nova senha e a confirmação não conferem.", 400);
    }

    if (currentPassword === newPassword) {
      return jsonError("A nova senha deve ser diferente da senha atual.", 400);
    }

    const users = await sql<UserPasswordRow[]>`
      SELECT id, password_hash
      FROM app_users
      WHERE id = ${user.id}::uuid AND is_active = true
      LIMIT 1
    `;

    const storedUser = users[0];

    if (!storedUser || !verifyPassword(currentPassword, storedUser.password_hash)) {
      return jsonError("Senha atual inválida.", 401);
    }

    await sql`
      UPDATE app_users
      SET password_hash = ${hashPassword(newPassword)}
      WHERE id = ${user.id}::uuid
    `;

    const currentToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (currentToken) {
      await sql`
        DELETE FROM app_sessions
        WHERE user_id = ${user.id}::uuid
          AND token_hash <> ${hashSessionToken(currentToken)}
      `;
    }

    return jsonOk({ updated: true, message: "Senha alterada com sucesso." });
  } catch (error) {
    return toErrorResponse(error);
  }
}
