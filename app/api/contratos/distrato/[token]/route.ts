import { NextRequest, NextResponse } from "next/server";
import { getContractByDistratoToken, signDistrato } from "@/services/contracts";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { nome, cpf } = await req.json();

  if (!nome || !cpf) {
    return NextResponse.json({ error: "Nome e CPF são obrigatórios." }, { status: 400 });
  }

  const contract = await getContractByDistratoToken(token);
  if (!contract) {
    return NextResponse.json({ error: "Distrato não encontrado." }, { status: 404 });
  }
  if (contract.status !== "pending_cancellation") {
    return NextResponse.json({ error: "Este distrato não está aguardando assinatura." }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "desconhecido";

  await signDistrato(token, nome, cpf, ip);

  return NextResponse.json({ ok: true });
}
