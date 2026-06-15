import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { sql } from "@/lib/db";

export type UserRole = "admin" | "user";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const SESSION_COOKIE_NAME = "selectsaas_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveRoleForEmail(email: string): UserRole {
  return getAdminEmails().includes(email.trim().toLowerCase()) ? "admin" : "user";
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await sql`
    INSERT INTO app_sessions (user_id, token_hash, expires_at)
    VALUES (${userId}::uuid, ${tokenHash}, ${expiresAt.toISOString()}::timestamptz)
  `;

  return token;
}

export async function setSessionCookie(token: string) {
  const cookieStore = cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await destroySession(token);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function destroySession(token: string) {
  await sql`
    DELETE FROM app_sessions
    WHERE token_hash = ${hashToken(token)}
  `;
}

export async function getSessionUserByToken(token?: string): Promise<SessionUser | null> {
  if (!token) return null;

  const rows = await sql<UserRow[]>`
    SELECT u.id, u.name, u.email, u.role
    FROM app_sessions s
    INNER JOIN app_users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)}
      AND s.expires_at > now()
      AND u.is_active = true
    LIMIT 1
  `;

  if (!rows[0]) return null;

  await sql`
    UPDATE app_sessions
    SET last_seen_at = now()
    WHERE token_hash = ${hashToken(token)}
  `;

  return rows[0];
}

export async function getSessionUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return getSessionUserByToken(token);
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  return getSessionUserByToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function requireRequestUser(request: NextRequest) {
  const user = await getSessionUserFromRequest(request);

  if (!user) {
    throw Object.assign(new Error("Sessão inválida ou expirada."), { status: 401 });
  }

  return user;
}

export async function requireAdminUser(request: NextRequest) {
  const user = await requireRequestUser(request);

  if (user.role !== "admin") {
    throw Object.assign(new Error("Acesso restrito ao administrador."), { status: 403 });
  }

  return user;
}
