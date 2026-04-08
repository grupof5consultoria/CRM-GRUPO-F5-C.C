import { notFound } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getClientById, getInternalUsersForSelect, CLIENT_STATUS_LABELS, CLIENT_STATUS_VARIANTS } from "@/services/clients";
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_VARIANTS } from "@/services/contracts";
import { CHARGE_STATUS_LABELS, CHARGE_STATUS_VARIANTS } from "@/services/billing";
import { TASK_STATUS_LABELS, TASK_STATUS_VARIANTS } from "@/services/tasks";
import { CLIENT_HEALTH_LABELS, CLIENT_HEALTH_VARIANTS, CLIENT_HEALTH_COLORS } from "@/utils/status-labels";
import { EditClientForm } from "./EditClientForm";
import { AddContactForm } from "./AddContactForm";
import { DeleteContactButton } from "./DeleteContactButton";
import { UpdateHealthForm } from "./UpdateHealthForm";

interface PageProps { params: Promise<{ id: string }> }

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [client, users] = await Promise.all([getClientById(id), getInternalUsersForSelect()]);
  if (!client) notFound();

  return (
    <>
      <Topbar title="Ficha do Cliente" />
      <main className="flex-1 p-6">
        <div className="mb-4">
          <Link href="/admin/clients" className="text-sm text-blue-600 hover:underline">← Voltar</Link>
        </div>
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
                      <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
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
                    <Link href="/admin/contracts/new" className="text-xs text-blue-600 hover:underline">+ Novo</Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {client.contracts.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <Link href={`/admin/contracts/${c.id}`} className="text-blue-600 hover:underline">{c.title}</Link>
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
                    <Link href={`/admin/billing?clientId=${client.id}`} className="text-xs text-blue-600 hover:underline">Ver todas</Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {client.charges.map((ch) => (
                    <div key={ch.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{ch.description}</span>
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
                    <Link href={`/admin/tasks?clientId=${client.id}`} className="text-xs text-blue-600 hover:underline">Ver todas</Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {client.tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <Link href={`/admin/tasks/${t.id}`} className="text-blue-600 hover:underline">{t.title}</Link>
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
          <div className="space-y-6">
            {/* Saúde do Cliente */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Saúde do Cliente</CardTitle>
                  <Badge variant={CLIENT_HEALTH_VARIANTS[client.health]}>
                    {CLIENT_HEALTH_LABELS[client.health]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.healthNote && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                    {client.healthNote}
                  </p>
                )}
                <UpdateHealthForm clientId={client.id} currentHealth={client.health} />

                {client.healthLogs.length > 0 && (
                  <div className="border-t dark:border-gray-700 pt-3 mt-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Histórico</p>
                    <div className="space-y-1.5">
                      {client.healthLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-2 text-xs">
                          <span className={`mt-0.5 font-bold ${CLIENT_HEALTH_COLORS[log.health]}`}>●</span>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{CLIENT_HEALTH_LABELS[log.health]}</span>
                            {log.note && <span className="text-gray-400"> — {log.note}</span>}
                            <p className="text-gray-400">{new Date(log.createdAt).toLocaleDateString("pt-BR")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><p className="text-gray-500">Responsável</p><p className="font-medium">{client.owner.name}</p></div>
                {client.monthlyValue != null && (
                  <div className="bg-emerald-50 dark:bg-emerald-950 rounded-xl px-3 py-2.5">
                    <p className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">Valor Mensal</p>
                    <p className="text-emerald-700 dark:text-emerald-300 text-xl font-bold">
                      R$ {Number(client.monthlyValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                {client.document && <div><p className="text-gray-500">CPF / CNPJ</p><p className="font-medium">{client.document}</p></div>}
                {client.email && <div><p className="text-gray-500">Email</p><p className="font-medium">{client.email}</p></div>}
                {client.phone && <div><p className="text-gray-500">Telefone</p><p className="font-medium">{client.phone}</p></div>}
                {client.startDate && (() => {
                  const start = new Date(client.startDate);
                  const now = new Date();
                  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
                  const years = Math.floor(months / 12);
                  const remainingMonths = months % 12;
                  const timeStr = years > 0
                    ? `${years} ano${years > 1 ? "s" : ""}${remainingMonths > 0 ? ` e ${remainingMonths} mês${remainingMonths > 1 ? "es" : ""}` : ""}`
                    : `${months} mês${months !== 1 ? "es" : ""}`;
                  return (
                    <div className="bg-indigo-50 dark:bg-indigo-950 rounded-xl px-3 py-2.5">
                      <p className="text-indigo-500 text-xs font-medium">⏱️ Tempo de cliente</p>
                      <p className="text-indigo-700 dark:text-indigo-300 font-bold">{timeStr}</p>
                      <p className="text-indigo-400 text-xs">desde {start.toLocaleDateString("pt-BR")}</p>
                    </div>
                  );
                })()}
                <div><p className="text-gray-500">Cadastrado em</p><p className="font-medium">{new Date(client.createdAt).toLocaleDateString("pt-BR")}</p></div>
                {client.notes && <div><p className="text-gray-500">Observações</p><p className="text-gray-700 dark:text-gray-300">{client.notes}</p></div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
