import { NextRequest, NextResponse } from "next/server";
import { requireInternalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

/**
 * POST /api/admin/client-users
 * Cria um usuário de acesso ao portal para um cliente existente.
 * Body: { clientId, name, email, password, role }
 */
export async function POST(req: NextRequest) {
  try {
    await requireInternalAuth();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { clientId, name, email, password, role } = await req.json();

  if (!clientId || !name || !email || !password) {
    return NextResponse.json({ error: "Campos obrigatórios: clientId, name, email, password" }, { status: 400 });
  }

  const validRoles: UserRole[] = ["client_admin", "client_team", "client_viewer"];
  const userRole: UserRole = validRoles.includes(role) ? role : "client_viewer";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: userRole, isActive: true },
  });

  await prisma.clientUser.create({
    data: { clientId, userId: user.id },
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
