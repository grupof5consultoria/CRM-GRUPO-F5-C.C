import { notFound } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getClientById, getInternalUsersForSelect, CLIENT_STATUS_LABELS, CLIENT_STATUS_VARIANTS } from "@/services/clients";
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_VARIANTS } from "@/services/contracts";
import { CHARGE_STATUS_LABELS, CHARGE_STATUS_VARIANTS } from "@/services/billing";
import { TASK_STATUS_LABELS, TASK_STATUS_VARIANTS } from "@/services/tasks";
import { EditClientForm } from "./EditClientForm";
import { AddContactForm } from "./AddContactForm";
import { DeleteContactButton } from "./DeleteContactButton";
import { ClientSidebar } from "./ClientSidebar";
import { headers } from "next/headers";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ meta_success?: string; meta_error?: string }>;
}

export default async function ClientDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { meta_success, meta_error } = await searchParams;
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const portalUrl = `${protocol}://${host}/portal/login`;

  const [client, users] = await Promise.all([getClientById(id), getInternalUsersForSelect()]);
  if (!client) notFound();

  return (
    <>
      <Topbar title="Ficha do Cliente" backHref="/admin/clients" backLabel="Clientes" />
      <main className="flex-1 p-6 bg-[#111111] min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{client.name}</CardTitle>
                  <Badge variant={CLIENT_STATUS_VARIANTS[client.status]}>{CLIENT_STATUS_LABELS[client.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent><EditClientForm client={client} users={users} /></CardContent>
            </Card>

            {/* Contatos */}
            <Card>
              <CardHeader><CardTitle>Contatos</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {client.contacts.length > 0 && (
                  <div className="space-y-2">
                    {client.contacts.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-[#171717] rounded-xl text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{c.name} {c.isPrimary && <span className="text-xs text-blue-600 ml-1">(principal)</span>}</p>
                          <p className="text-gray-500 text-xs">{[c.role, c.email, c.phone].filter(Boolean).join(" · ")}</p>
                        </div>
                        <DeleteContactButton contactId={c.id} clientId={client.id} />
                      </div>
                    ))}
                  </div>
                )}
                <AddContactForm clientId={client.id} />
              </CardContent>
            </Card>

            {/* Contratos */}
            {client.contracts.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Contratos</CardTitle>
                    <Link href="/admin/contracts/new" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">+ Novo</Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {client.contracts.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <Link href={`/admin/contracts/${c.id}`} className="text-violet-400 hover:text-violet-300 transition-colors">{c.title}</Link>
                      <div className="flex items-center gap-2">
                        {c.value && <span className="text-gray-500">R$ {Number(c.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                        <Badge variant={CONTRACT_STATUS_VARIANTS[c.status]}>{CONTRACT_STATUS_LABELS[c.status]}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Cobranças recentes */}
            {client.charges.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Cobranças Recentes</CardTitle>
                    <Link href={`/admin/billing?clientId=${client.id}`} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Ver todas</Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {client.charges.map((ch) => (
                    <div key={ch.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{ch.description}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{new Date(ch.dueDate).toLocaleDateString("pt-BR")}</span>
                        <span className="font-medium">R$ {Number(ch.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        <Badge variant={CHARGE_STATUS_VARIANTS[ch.status]}>{CHARGE_STATUS_LABELS[ch.status]}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tarefas recentes */}
            {client.tasks.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tarefas Recentes</CardTitle>
                    <Link href={`/admin/tasks?clientId=${client.id}`} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Ver todas</Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {client.tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <Link href={`/admin/tasks/${t.id}`} className="text-violet-400 hover:text-violet-300 transition-colors">{t.title}</Link>
                      <div className="flex items-center gap-2">
                        {t.dueDate && <span className="text-gray-500">{new Date(t.dueDate).toLocaleDateString("pt-BR")}</span>}
                        <Badge variant={TASK_STATUS_VARIANTS[t.status]}>{TASK_STATUS_LABELS[t.status]}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <ClientSidebar
              clientId={client.id}
              portalUrl={portalUrl}
              metaAdAccountId={client.metaAdAccountId ?? null}
              googleAdsCustomerId={client.googleAdsCustomerId ?? null}
              metaSuccess={meta_success === "1"}
              metaError={meta_error ? decodeURIComponent(meta_error) : undefined}
              ownerName={client.owner.name}
              monthlyValue={client.monthlyValue}
              document={client.document ?? null}
              email={client.email ?? null}
              phone={client.phone ?? null}
              startDate={client.startDate ?? null}
              createdAt={client.createdAt}
              notes={client.notes ?? null}
              health={client.health}
              healthNote={client.healthNote ?? null}
              healthLogs={client.healthLogs}
              portalUsers={client.clientUsers.map((cu) => ({
                id: cu.id,
                userId: cu.userId,
                user: cu.user,
              }))}
            />
          </div>
        </div>
      </main>
    </>
  );
}
