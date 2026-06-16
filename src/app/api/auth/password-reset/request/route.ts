import { createHash, randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { jsonError, jsonOk, toErrorResponse } from "@/lib/api-response";
import { isValidEmail, normalizeEmail, requireText } from "@/lib/validators";

const RESET_TOKEN_EXPIRES_IN_MS = 60 * 60 * 1000;

interface UserRow {
  id: string;
  email: string;
  is_active: boolean;
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getAppOrigin(request: NextRequest) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = normalizeEmail(requireText(body.email, "E-mail", 5, 180));

    if (!isValidEmail(email)) {
      return jsonError("Informe um e-mail válido.", 400);
    }

    const safeResponse = jsonOk({
      requested: true,
      message: "Se o e-mail informado estiver cadastrado, enviaremos as instruções de recuperação de senha.",
    });

    const users = await sql<UserRow[]>`
      SELECT id, email, is_active
      FROM app_users
      WHERE email = ${email}
      LIMIT 1
    `;

    const user = users[0];

    if (!user || !user.is_active) {
      return safeResponse;
    }

    await sql`
      DELETE FROM app_password_reset_tokens
      WHERE user_id = ${user.id}::uuid
        AND (used_at IS NOT NULL OR expires_at <= now() OR created_at < now() - interval '2 minutes')
    `;

    const recentTokens = await sql<{ id: string }[]>`
      SELECT id
      FROM app_password_reset_tokens
      WHERE user_id = ${user.id}::uuid
        AND used_at IS NULL
        AND expires_at > now()
        AND created_at >= now() - interval '2 minutes'
      LIMIT 1
    `;

    if (recentTokens[0]) {
      return safeResponse;
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_IN_MS);

    await sql`
      INSERT INTO app_password_reset_tokens (user_id, token_hash, expires_at)
      VALUES (${user.id}::uuid, ${hashResetToken(token)}, ${expiresAt.toISOString()}::timestamptz)
    `;

    const resetUrl = `${getAppOrigin(request)}/recuperar-senha?token=${token}`;
    await sendPasswordResetEmail({ to: user.email, resetUrl });

    return safeResponse;
  } catch (error) {
    return toErrorResponse(error);
  }
}
