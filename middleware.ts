import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "selectsaas_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if ((pathname.startsWith("/suporte") || pathname.startsWith("/admin")) && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && hasSession) {
    const supportUrl = request.nextUrl.clone();
    supportUrl.pathname = "/suporte";
    supportUrl.search = "";
    return NextResponse.redirect(supportUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/suporte/:path*", "/admin/:path*", "/login"],
};
