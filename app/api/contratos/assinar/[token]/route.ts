import { NextRequest, NextResponse } from "next/server";
import { signContract } from "@/services/contracts";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { nome, cpf } = await req.json() as { nome: string; cpf: string };

  if (!nome?.trim() || !cpf?.trim()) {
    return NextResponse.json({ error: "Nome e CPF são obrigatórios." }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  try {
    await signContract(token, nome.trim(), cpf.trim(), ip);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
