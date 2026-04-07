import { jwtVerify } from "jose";
import { UserRole } from "@prisma/client";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "fallback-dev-secret"
);

export interface SessionPayload {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  clientId?: string;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function isInternalRole(role: UserRole): boolean {
  return ["owner", "admin", "operations_manager", "sales", "finance", "operations"].includes(role);
}

export function isClientRole(role: UserRole): boolean {
  return ["client_admin", "client_team", "client_viewer"].includes(role);
}
