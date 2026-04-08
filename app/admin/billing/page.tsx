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

interface PageProps {
  searchParams: Promise<{ status?: string; clientId?: string; contractId?: string }>;
}

export default async function BillingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [charges, clients] = await Promise.all([
    getCharges({
      status: params.status as ChargeStatus | undefined,
      clientId: params.clientId,
      contractId: params.contractId,
    }),
    getClients({ status: "active" }),
  ]);

  const totalPending = charges.filter((c) => c.status === "pending").reduce((s, c) => s + Number(c.value), 0);
  const totalPaid = charges.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.value), 0);
  const now = new Date();
  const overdueCount = charges.filter((c) => c.status === "pending" && new Date(c.dueDate) < now).length;

  const STATUS_OPTIONS = [
    { value: "", label: "Todos os status" },
    { value: "pending", label: "Pendente" },
    { value: "paid", label: "Pago" },
    { value: "overdue", label: "Vencido" },
    { value: "cancelled", label: "Cancelado" },
  ];

  return (
    <>
      <Topbar title="Financeiro" />
      <main className="flex-1 p-6">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-sm text-gray-500">Pendente a Receber</p>
            <p className="text-xl font-bold text-yellow-600 mt-1">
              R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Recebido (filtro)</p>
            <p className="text-xl font-bold text-green-600 mt-1">
              R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-sm text-gray-500">Cobranças Vencidas</p>
            <p className={`text-xl font-bold mt-1 ${overdueCount > 0 ? "text-red-600" : "text-gray-400"}`}>
              {overdueCount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Nova Cobrança</h2>
              <NewChargeForm clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
            </div>
          </div>

          {/* Tabela */}
          <div className="lg:col-span-2">
            <form className="flex gap-2 mb-4">
              <select name="status" defaultValue={params.status ?? ""} className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button type="submit" className="px-4 py-2 rounded-lg border border-gray-300 text-sm bg-white hover:bg-gray-50">Filtrar</button>
            </form>

            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Descrição</TableTh>
                  <TableTh>Cliente</TableTh>
                  <TableTh>Valor</TableTh>
                  <TableTh>Vencimento</TableTh>
                  <TableTh>Pagamento</TableTh>
                  <TableTh>Status</TableTh>
                  <TableTh></TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {charges.length === 0 ? (
                  <EmptyRow cols={7} message="Nenhuma cobrança encontrada." />
                ) : (
                  charges.map((charge) => {
                    const isOverdue = charge.status === "pending" && new Date(charge.dueDate) < now;
                    return (
                      <TableRow key={charge.id}>
                        <TableTd>
                          <div>
                            <p className="font-medium text-gray-900">{charge.description}</p>
                            {charge.contract && (
                              <Link href={`/admin/contracts/${charge.contract.id}`} className="text-xs text-blue-600 hover:underline">
                                {charge.contract.title}
                              </Link>
                            )}
                          </div>
                        </TableTd>
                        <TableTd>
                          <Link href={`/admin/clients/${charge.client.id}`} className="hover:text-blue-600">
                            {charge.client.name}
                          </Link>
                        </TableTd>
                        <TableTd className="font-medium">
                          R$ {Number(charge.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableTd>
                        <TableTd>
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                            {new Date(charge.dueDate).toLocaleDateString("pt-BR")}
                            {isOverdue && " ⚠️"}
                          </span>
                        </TableTd>
                        <TableTd>
                          <div className="text-xs space-y-0.5">
                            <span>{{
                              pix: "💠 PIX",
                              boleto: "📄 Boleto",
                              credit_card: "💳 Cartão",
                              bank_transfer: "🏦 Transf.",
                              cash: "💵 Dinheiro",
                            }[charge.paymentMethod]}</span>
                            {charge.isRecurring && (
                              <p className="text-indigo-500 font-medium">🔄 Recorrente{charge.recurrenceDay ? ` · dia ${charge.recurrenceDay}` : ""}</p>
                            )}
                          </div>
                        </TableTd>
                        <TableTd>
                          <Badge variant={CHARGE_STATUS_VARIANTS[charge.status]}>
                            {CHARGE_STATUS_LABELS[charge.status]}
                          </Badge>
                        </TableTd>
                        <TableTd>
                          <ChargeActions chargeId={charge.id} status={charge.status} />
                        </TableTd>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </>
  );
}
