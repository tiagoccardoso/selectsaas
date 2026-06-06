import { NextRequest, NextResponse } from "next/server";
import {
  comparePasswords,
  generateSessionToken,
  SESSION_COOKIE,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Senha inválida" }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD ?? "";
    const valid = await comparePasswords(password, adminPassword);

    if (!valid) {
      // Small delay to slow brute force
      await new Promise((r) => setTimeout(r, 600));
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const secret = process.env.ADMIN_SESSION_SECRET ?? "";
    const token = await generateSessionToken(secret);

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24h in seconds
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
