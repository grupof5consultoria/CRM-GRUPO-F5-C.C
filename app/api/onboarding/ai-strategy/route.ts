import { NextRequest, NextResponse } from "next/server";
import { requireInternalAuth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  await requireInternalAuth();

  const { niche } = await req.json() as { niche: string };
  if (!niche?.trim()) return NextResponse.json({ error: "Nicho obrigatório" }, { status: 400 });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Você é um especialista em tráfego pago. O cliente é do nicho: ${niche}.
Com base nisso, sugira:
1. Divisão de verba recomendada (Meta Ads x Google Ads)
2. Tipos de campanha indicados
3. Públicos-alvo principais
4. Ideias de criativos
5. 3 concorrentes típicos desse nicho para benchmarking

Responda APENAS em JSON válido com as chaves: budget_split (string), campaigns (array de strings), audiences (array de strings), creatives (array de strings), competitors (array de strings).`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const json = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ raw: text });
  }
}
