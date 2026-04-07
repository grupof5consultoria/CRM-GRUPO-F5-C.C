import { NextRequest, NextResponse } from "next/server";
import { acceptProposal } from "@/services/proposals";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { acceptedBy } = await req.json();

  if (!acceptedBy?.trim()) {
    return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  }

  const proposal = await acceptProposal(token, acceptedBy.trim());

  if (!proposal) {
    return NextResponse.json({ error: "Proposta não encontrada ou não disponível." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
