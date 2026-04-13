"use server";

import { upsertWikiPage } from "@/services/agencia";
import { revalidatePath } from "next/cache";

export async function upsertEducacionalPageAction(section: string, slug: string, title: string, content: string) {
  await upsertWikiPage(section, slug, title, content);
  revalidatePath("/admin/agencia/educacional");
}
