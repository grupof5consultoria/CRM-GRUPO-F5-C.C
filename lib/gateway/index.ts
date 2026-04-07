/**
 * Camada de integração com gateway de cobrança.
 * Estrutura preparada para conectar a qualquer gateway (Asaas, Stripe, PagSeguro, etc.)
 * Substitua as implementações abaixo com as chamadas reais da API do gateway escolhido.
 */

export interface GatewayChargeInput {
  externalCustomerId?: string;
  customerName: string;
  customerEmail?: string;
  customerDocument?: string;
  description: string;
  value: number;
  dueDate: string; // YYYY-MM-DD
  internalChargeId: string;
}

export interface GatewayChargeResult {
  externalId: string;
  paymentLink: string;
  status: string;
}

export interface GatewayWebhookPayload {
  event: string;
  chargeId: string; // ID externo do gateway
  status: string;
  paidAt?: string;
}

/**
 * Cria uma cobrança no gateway externo.
 * Retorna o ID externo e o link de pagamento.
 */
export async function createGatewayCharge(
  input: GatewayChargeInput
): Promise<GatewayChargeResult | null> {
  const apiKey = process.env.PAYMENT_GATEWAY_API_KEY;

  if (!apiKey) {
    console.warn("[Gateway] PAYMENT_GATEWAY_API_KEY não configurada. Cobrança criada apenas localmente.");
    return null;
  }

  // TODO: substituir pela chamada real do gateway
  // Exemplo com Asaas:
  // const res = await fetch("https://api.asaas.com/v3/payments", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", "access_token": apiKey },
  //   body: JSON.stringify({
  //     customer: input.externalCustomerId,
  //     billingType: "BOLETO",
  //     value: input.value,
  //     dueDate: input.dueDate,
  //     description: input.description,
  //     externalReference: input.internalChargeId,
  //   }),
  // });
  // const data = await res.json();
  // return { externalId: data.id, paymentLink: data.bankSlipUrl, status: data.status };

  console.log("[Gateway] Simulando criação de cobrança:", input);
  return null;
}

/**
 * Verifica a assinatura do webhook para garantir que veio do gateway.
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET;
  if (!secret) return true; // sem secret configurado, aceita (apenas dev)

  // TODO: implementar verificação de assinatura conforme documentação do gateway
  // Exemplo com HMAC-SHA256:
  // const crypto = require("crypto");
  // const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  // return expected === signature;

  return true;
}

/**
 * Mapeia o status do gateway para o status interno.
 */
export function mapGatewayStatus(gatewayStatus: string): "pending" | "paid" | "overdue" | "cancelled" | null {
  const map: Record<string, "pending" | "paid" | "overdue" | "cancelled"> = {
    PENDING: "pending",
    RECEIVED: "paid",
    CONFIRMED: "paid",
    OVERDUE: "overdue",
    REFUNDED: "cancelled",
    CANCELLED: "cancelled",
    // Stripe equivalents
    paid: "paid",
    open: "pending",
    uncollectible: "overdue",
    void: "cancelled",
  };

  return map[gatewayStatus] ?? null;
}
