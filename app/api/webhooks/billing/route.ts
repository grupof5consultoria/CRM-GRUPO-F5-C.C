import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, mapGatewayStatus } from "@/lib/gateway";
import { ChargeStatus } from "@prisma/client";
import { CHARGE_STATUS_LABELS } from "@/services/billing";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-gateway-signature") ?? "";

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  let payload: { event: string; chargeId: string; status: string; paidAt?: string };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const { chargeId: externalId, status: gatewayStatus, paidAt } = payload;

  const charge = await prisma.charge.findFirst({ where: { externalId } });

  if (!charge) {
    console.warn("[Webhook] Cobrança não encontrada para externalId:", externalId);
    return NextResponse.json({ ok: true }); // retorna 200 para o gateway não reenviar
  }

  const internalStatus = mapGatewayStatus(gatewayStatus);

  if (!internalStatus) {
    console.warn("[Webhook] Status desconhecido:", gatewayStatus);
    return NextResponse.json({ ok: true });
  }

  await prisma.charge.update({
    where: { id: charge.id },
    data: {
      status: internalStatus as ChargeStatus,
      paidAt: internalStatus === "paid" && paidAt ? new Date(paidAt) : undefined,
      gatewayResponse: payload as object,
    },
  });

  await prisma.chargeEvent.create({
    data: {
      chargeId: charge.id,
      type: "webhook",
      description: `Status atualizado via webhook: ${CHARGE_STATUS_LABELS[internalStatus as ChargeStatus]}`,
    },
  });

  console.log(`[Webhook] Cobrança ${charge.id} → ${internalStatus}`);

  return NextResponse.json({ ok: true });
}
