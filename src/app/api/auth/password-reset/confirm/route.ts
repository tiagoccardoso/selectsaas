import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { requireText } from "@/lib/validators";

interface ResetTokenRow {
  id: string;
  user_id: string;
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function isValidResetToken(token: string) {
  return /^[a-f0-9]{64}$/i.test(token);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = requireText(body.token, "Token de recuperação", 20, 200);
    const password = requireText(body.password, "Nova senha", 8, 200);
    const confirmPassword = requireText(body.confirmPassword, "Confirmação da nova senha", 8, 200);

    if (!isValidResetToken(token)) {
      return jsonError("Link de recuperação inválido ou expirado.", 400);
    }

    if (password !== confirmPassword) {
      return jsonError("A nova senha e a confirmação não conferem.", 400);
    }

    const tokens = await sql<ResetTokenRow[]>`
      SELECT t.id, t.user_id
      FROM app_password_reset_tokens t
      INNER JOIN app_users u ON u.id = t.user_id
      WHERE t.token_hash = ${hashResetToken(token)}
        AND t.used_at IS NULL
        AND t.expires_at > now()
        AND u.is_active = true
      LIMIT 1
    `;

    const resetToken = tokens[0];

    if (!resetToken) {
      return jsonError("Link de recuperação inválido ou expirado.", 400);
    }

    await sql`
      UPDATE app_users
      SET password_hash = ${hashPassword(password)}
      WHERE id = ${resetToken.user_id}::uuid
    `;

    await sql`
      UPDATE app_password_reset_tokens
      SET used_at = now()
      WHERE id = ${resetToken.id}::uuid
    `;

    await sql`
      DELETE FROM app_sessions
      WHERE user_id = ${resetToken.user_id}::uuid
    `;

    return jsonOk({ reset: true, message: "Senha redefinida com sucesso. Você já pode entrar com a nova senha." });
  } catch (error) {
    return toErrorResponse(error);
  }
}
