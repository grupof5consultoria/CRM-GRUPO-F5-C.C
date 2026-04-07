import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "fallback-dev-secret"
);

export interface SessionPayload {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  clientId?: string; // para usuários do portal
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifySession(token);
}

export function isInternalRole(role: UserRole): boolean {
  return ["owner", "admin", "operations_manager", "sales", "finance", "operations"].includes(role);
}

export function isClientRole(role: UserRole): boolean {
  return ["client_admin", "client_team", "client_viewer"].includes(role);
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireInternalAuth(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!isInternalRole(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireClientAuth(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!isClientRole(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
