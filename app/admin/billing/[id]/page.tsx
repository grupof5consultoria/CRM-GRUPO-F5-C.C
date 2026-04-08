import { notFound } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getChargeById } from "@/services/billing";
import { EditChargeForm } from "./EditChargeForm";

interface PageProps { params: Promise<{ id: string }> }

export default async function EditChargePage({ params }: PageProps) {
  const { id } = await params;
  const charge = await getChargeById(id);
  if (!charge) notFound();

  return (
    <>
      <Topbar title="Editar Cobrança" />
      <main className="flex-1 p-6 max-w-2xl">
        <div className="mb-4">
          <Link href="/admin/billing" className="text-sm text-indigo-600 hover:underline">← Voltar ao Financeiro</Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Editar Cobrança</CardTitle>
          </CardHeader>
          <CardContent>
            <EditChargeForm charge={charge} />
          </CardContent>
        </Card>

        {charge.events.length > 0 && (
          <Card className="mt-6">
            <CardHeader><CardTitle>Histórico de Pagamentos</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {charge.events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 text-indigo-400">●</span>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
                    <p className="text-xs text-gray-400">{new Date(event.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
