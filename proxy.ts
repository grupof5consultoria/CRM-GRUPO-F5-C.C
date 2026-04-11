import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "./lib/auth-edge";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas públicas - não precisam de autenticação
  const publicPaths = [
    "/",
    "/leticia",
    "/login",
    "/portal/login",
    "/recover-password",
    "/privacidade",
    "/termos",
    "/proposal/",
    "/api/webhooks/",
    "/_next/",
    "/favicon.ico",
    "/icon.svg",
  ];

  if (publicPaths.some((p) => pathname === p || (p.endsWith("/") && pathname.startsWith(p)))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;

  if (!token) {
    if (pathname.startsWith("/portal")) {
      return NextResponse.redirect(new URL("/portal/login", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const session = await verifySession(token);

  if (!session) {
    if (pathname.startsWith("/portal")) {
      return NextResponse.redirect(new URL("/portal/login", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const internalRoles = ["owner", "admin", "operations_manager", "sales", "finance", "operations"];
  const clientRoles = ["client_admin", "client_team", "client_viewer"];

  // Usuário interno tentando acessar portal
  if (pathname.startsWith("/portal") && internalRoles.includes(session.role)) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // Usuário cliente tentando acessar área interna
  if (pathname.startsWith("/admin") && clientRoles.includes(session.role)) {
    return NextResponse.redirect(new URL("/portal/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)",
  ],
};

export default proxy;
