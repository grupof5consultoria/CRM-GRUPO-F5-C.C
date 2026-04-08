"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession, createSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ProfileActionResult = { error?: string; success?: string };

export async function updateProfileAction(
  _prev: ProfileActionResult,
  formData: FormData
): Promise<ProfileActionResult> {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const avatarUrl = (formData.get("avatarUrl") as string)?.trim() || null;

  if (!name) return { error: "Nome é obrigatório" };
  if (!email || !email.includes("@")) return { error: "Email inválido" };

  // Check email conflict
  if (email !== session.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== session.userId) {
      return { error: "Este email já está em uso" };
    }
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { name, email, avatarUrl },
  });

  // Refresh session cookie with new name/email
  const newToken = await createSession({
    ...session,
    name,
    email,
  });
  const cookieStore = await cookies();
  cookieStore.set("session", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  revalidatePath("/admin", "layout");
  return { success: "Perfil atualizado com sucesso!" };
}

export async function updatePasswordAction(
  _prev: ProfileActionResult,
  formData: FormData
): Promise<ProfileActionResult> {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Preencha todos os campos" };
  }
  if (newPassword.length < 6) {
    return { error: "A nova senha deve ter pelo menos 6 caracteres" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "As senhas não coincidem" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "Usuário não encontrado" };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: "Senha atual incorreta" };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: session.userId }, data: { passwordHash } });

  return { success: "Senha alterada com sucesso!" };
}
