import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const slug = (form.get("slug") as string) || "landing";
  const field = (form.get("field") as string) || "image";

  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });

  // Validate type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 });
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Imagem muito grande (máx 5MB)" }, { status: 400 });
  }

  try {
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `landing/${slug}/${field}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[landing-upload]", err);
    return NextResponse.json({ error: "Falha ao fazer upload" }, { status: 500 });
  }
}
