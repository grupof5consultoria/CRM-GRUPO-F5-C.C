import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getLeadById, LEAD_STATUS_LABELS, LEAD_STATUS_VARIANTS } from "@/services/leads";
import { EditLeadForm } from "./EditLeadForm";
import { AddActivityForm } from "./AddActivityForm";
import { UpdateStatusForm } from "./UpdateStatusForm";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) notFound();

  const ACTIVITY_ICONS: Record<string, string> = {
    created: "🟢",
    updated: "·",
    status_changed: "🔄",
    call: "📞",
    email: "📧",
    meeting: "🤝",
    note: "📝",
  };

  return (
    <>
      <Topbar title="Detalhe do Lead" backHref="/admin/crm" backLabel="CRM" />
      <main className="flex-1 p-6 bg-[#111111] min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info do Lead */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{lead.name}</CardTitle>
                  <Badge variant={LEAD_STATUS_VARIANTS[lead.status]}>
                    {LEAD_STATUS_LABELS[lead.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <EditLeadForm lead={lead} />
              </CardContent>
            </Card>

            {/* Histórico de Atividades */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico Comercial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddActivityForm leadId={lead.id} />

                <div className="space-y-3 mt-4">
                  {lead.activities.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhuma atividade registrada.</p>
                  ) : (
                    lead.activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
                        <div>
                          <p className="text-gray-200">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {activity.user.name} ·{" "}
                            {new Date(activity.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Propostas */}
            {lead.proposals.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Propostas</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lead.proposals.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <Link href={`/admin/proposals/${p.id}`} className="text-violet-400 hover:text-violet-300 transition-colors">
                          {p.title}
                        </Link>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">
                            R$ {Number(p.totalValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <Badge variant="gray">{p.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Alterar Status</CardTitle></CardHeader>
              <CardContent>
                <UpdateStatusForm leadId={lead.id} currentStatus={lead.status} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Responsável</p>
                  <p className="font-medium">{lead.owner.name}</p>
                </div>
                {lead.nextFollowUp && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Próximo Follow-up</p>
                    <p className="font-medium">
                      {new Date(lead.nextFollowUp).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Criado em</p>
                  <p className="font-medium">
                    {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {lead.company && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Empresa</p>
                    <p className="font-medium">{lead.company}</p>
                  </div>
                )}
                {lead.email && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="font-medium">{lead.email}</p>
                  </div>
                )}
                {lead.phone && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Telefone</p>
                    <p className="font-medium">{lead.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
