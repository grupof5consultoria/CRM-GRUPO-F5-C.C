"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { createSession, isClientRole, isInternalRole } from "./auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export type ActionResult = {
  error?: string;
  success?: boolean;
};

export async function loginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return { error: "Credenciais inválidas" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Credenciais inválidas" };
  }

  let clientId: string | undefined;
  if (isClientRole(user.role)) {
    const clientUser = await prisma.clientUser.findUnique({
      where: { userId: user.id },
    });
    clientId = clientUser?.clientId;
  }

  const token = await createSession({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    clientId,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8h
    path: "/",
  });

  if (isClientRole(user.role)) {
    redirect("/portal/dashboard");
  } else {
    redirect("/admin/dashboard");
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
