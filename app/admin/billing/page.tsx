import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd, EmptyRow } from "@/components/ui/Table";
import { getCharges, CHARGE_STATUS_LABELS, CHARGE_STATUS_VARIANTS } from "@/services/billing";
import { getClients } from "@/services/clients";
import { ChargeStatus } from "@prisma/client";
import { NewChargeForm } from "./NewChargeForm";
import { ChargeActions } from "./ChargeActions";
import Link from "next/link";

export const metadata = { title: "Financeiro | Gestão Interna" };

const PAYMENT_LABELS: Record<string, string> = {
  pix: "PIX",
  boleto: "Boleto",
  credit_card: "Cartão",
  bank_transfer: "Transf.",
  cash: "Dinheiro",
};

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function getPeriod(dueDate: Date) {
  const d = new Date(dueDate);
  return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: `${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}` };
}

interface PageProps {
  searchParams: Promise<{ status?: string; clientId?: string }>;
}

export default async function BillingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [charges, clients] = await Promise.all([
    getCharges({ status: params.status as ChargeStatus | undefined, clientId: params.clientId }),
    getClients({ status: "active" }),
  ]);

  const now = new Date();
  const totalPending = charges.filter((c) => c.status === "pending").reduce((s, c) => s + Number(c.value), 0);
  const totalPaid    = charges.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.value), 0);
  const overdueCount = charges.filter((c) => c.status === "pending" && new Date(c.dueDate) < now).length;

  // Group charges by month (descending)
  const grouped = new Map<string, { label: string; charges: typeof charges }>();
  for (const charge of charges) {
    const { key, label } = getPeriod(charge.dueDate);
    if (!grouped.has(key)) grouped.set(key, { label, charges: [] });
    grouped.get(key)!.charges.push(charge);
  }
  const sortedGroups = Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  const STATUS_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "pending", label: "Pendente" },
    { value: "paid", label: "Pago" },
    { value: "cancelled", label: "Cancelado" },
  ];

  return (
    <>
      <Topbar title="Financeiro" />
      <main className="flex-1 p-6 space-y-6">

        {/* Cards resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">A Receber</p>
                <p className="text-xl font-bold text-amber-400">
                  R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Recebido</p>
                <p className="text-xl font-bold text-emerald-400">
                  R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${overdueCount > 0 ? "bg-red-500/10" : "bg-[#222]"}`}>
                <svg className={`w-5 h-5 ${overdueCount > 0 ? "text-red-400" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Vencidas</p>
                <p className={`text-xl font-bold ${overdueCount > 0 ? "text-red-400" : "text-gray-600"}`}>{overdueCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Formulário nova cobrança */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-6 sticky top-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Nova Cobrança</h2>
              <NewChargeForm clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
            </div>
          </div>

          {/* Tabela agrupada por mês */}
          <div className="lg:col-span-2 space-y-4">
            <form className="flex gap-2">
              <select
                name="status"
                defaultValue={params.status ?? ""}
                className="rounded-xl border border-[#333] bg-[#1a1a1a] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button type="submit" className="px-4 py-2 rounded-xl border border-[#333] text-sm bg-[#1a1a1a] text-gray-400 hover:bg-[#222] transition-colors">
                Filtrar
              </button>
            </form>

            {charges.length === 0 ? (
              <div className="bg-[#1a1a1a] rounded-2xl border border-dashed border-[#333] p-10 text-center">
                <p className="text-gray-600 text-sm">Nenhuma cobrança encontrada.</p>
              </div>
            ) : (
              sortedGroups.map(([key, group]) => {
                const groupPending = group.charges.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.value), 0);
                const groupPaid    = group.charges.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.value), 0);
                const isCurrentMonth = key === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

                return (
                  <div key={key} className="bg-[#1a1a1a] rounded-2xl border border-[#262626] overflow-hidden">
                    {/* Cabeçalho do mês */}
                    <div className={`px-5 py-3 border-b border-[#262626] flex items-center justify-between ${isCurrentMonth ? "bg-violet-600/10" : ""}`}>
                      <div className="flex items-center gap-2">
                        {isCurrentMonth && (
                          <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
                        )}
                        <span className={`text-sm font-bold ${isCurrentMonth ? "text-violet-300" : "text-gray-300"}`}>
                          {group.label}
                          {isCurrentMonth && <span className="ml-2 text-xs font-normal text-violet-400">• Mês atual</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        {groupPending > 0 && (
                          <span className="text-amber-400 font-medium">
                            A receber: R$ {groupPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        )}
                        {groupPaid > 0 && (
                          <span className="text-emerald-400 font-medium">
                            Recebido: R$ {groupPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Linhas do mês */}
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableTh>Cliente</TableTh>
                          <TableTh>Descrição</TableTh>
                          <TableTh>Valor</TableTh>
                          <TableTh>Vencimento</TableTh>
                          <TableTh>Via</TableTh>
                          <TableTh>Status</TableTh>
                          <TableTh>Ações</TableTh>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {group.charges.map((charge) => {
                          const isOverdue = charge.status === "pending" && new Date(charge.dueDate) < now;
                          return (
                            <TableRow key={charge.id}>
                              <TableTd>
                                <Link href={`/admin/clients/${charge.client.id}`} className="font-medium text-white hover:text-violet-400 transition-colors text-sm">
                                  {charge.client.name}
                                </Link>
                              </TableTd>
                              <TableTd>
                                <p className="text-gray-400 text-sm">{charge.description}</p>
                                {charge.contract && (
                                  <Link href={`/admin/contracts/${charge.contract.id}`} className="text-xs text-violet-500 hover:underline">
                                    {charge.contract.title}
                                  </Link>
                                )}
                                {charge.isRecurring && (
                                  <p className="text-xs text-violet-400 mt-0.5">🔄 Recorrente</p>
                                )}
                              </TableTd>
                              <TableTd>
                                <span className="font-semibold text-white text-sm">
                                  R$ {Number(charge.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </span>
                              </TableTd>
                              <TableTd>
                                <span className={`text-sm ${isOverdue ? "text-red-400 font-medium" : "text-gray-400"}`}>
                                  Dia {new Date(charge.dueDate).getDate()}
                                  {isOverdue && <span className="ml-1 text-xs">⚠</span>}
                                </span>
                                {charge.paidAt && (
                                  <p className="text-xs text-emerald-400 mt-0.5">
                                    Pago {new Date(charge.paidAt).toLocaleDateString("pt-BR")}
                                  </p>
                                )}
                              </TableTd>
                              <TableTd>
                                <span className="text-xs text-gray-600">{PAYMENT_LABELS[charge.paymentMethod] ?? charge.paymentMethod}</span>
                              </TableTd>
                              <TableTd>
                                <Badge variant={CHARGE_STATUS_VARIANTS[charge.status]}>
                                  {CHARGE_STATUS_LABELS[charge.status]}
                                </Badge>
                              </TableTd>
                              <TableTd>
                                <div className="flex items-center gap-2">
                                  <ChargeActions chargeId={charge.id} status={charge.status} />
                                  <Link href={`/admin/billing/${charge.id}`} className="text-gray-600 hover:text-violet-400 transition-colors" title="Editar">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </Link>
                                </div>
                              </TableTd>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </>
  );
}
