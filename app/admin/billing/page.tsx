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
  pix: "💠 PIX",
  boleto: "📄 Boleto",
  credit_card: "💳 Cartão",
  bank_transfer: "🏦 Transf.",
  cash: "💵 Dinheiro",
};

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
  const totalPaid = charges.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.value), 0);
  const overdueCount = charges.filter((c) => c.status === "pending" && new Date(c.dueDate) < now).length;

  const STATUS_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "pending", label: "Pendente" },
    { value: "paid", label: "Pago" },
    { value: "overdue", label: "Vencido" },
    { value: "cancelled", label: "Cancelado" },
  ];

  return (
    <>
      <Topbar title="Financeiro" />
      <main className="flex-1 p-6 space-y-6">

        {/* Resumo financeiro */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pendente a Receber</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Recebido</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${overdueCount > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                <svg className={`w-5 h-5 ${overdueCount > 0 ? "text-red-600 dark:text-red-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Vencidas</p>
                <p className={`text-xl font-bold ${overdueCount > 0 ? "text-red-600 dark:text-red-400" : "text-gray-300 dark:text-gray-600"}`}>
                  {overdueCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Formulário */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Nova Cobrança</h2>
              <NewChargeForm clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
            </div>
          </div>

          {/* Tabela */}
          <div className="lg:col-span-2">
            <form className="flex gap-2 mb-4">
              <select name="status" defaultValue={params.status ?? ""} className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button type="submit" className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Filtrar
              </button>
            </form>

            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Cliente</TableTh>
                  <TableTh>Descrição</TableTh>
                  <TableTh>Valor</TableTh>
                  <TableTh>Vencimento · Recorrência</TableTh>
                  <TableTh>Via</TableTh>
                  <TableTh>Status</TableTh>
                  <TableTh>Ações</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {charges.length === 0 ? (
                  <EmptyRow cols={7} message="Nenhuma cobrança encontrada." />
                ) : (
                  charges.map((charge) => {
                    const isOverdue = charge.status === "pending" && new Date(charge.dueDate) < now;
                    const recDay = charge.recurrenceDay ?? new Date(charge.dueDate).getDate();
                    return (
                      <TableRow key={charge.id}>
                        <TableTd>
                          <Link href={`/admin/clients/${charge.client.id}`} className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            {charge.client.name}
                          </Link>
                        </TableTd>
                        <TableTd>
                          <p className="text-gray-700 dark:text-gray-300">{charge.description}</p>
                          {charge.contract && (
                            <Link href={`/admin/contracts/${charge.contract.id}`} className="text-xs text-indigo-500 hover:underline">
                              {charge.contract.title}
                            </Link>
                          )}
                        </TableTd>
                        <TableTd>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            R$ {Number(charge.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </TableTd>
                        <TableTd>
                          <div>
                            <span className={`font-medium ${isOverdue ? "text-red-500" : "text-gray-800 dark:text-gray-200"}`}>
                              {new Date(charge.dueDate).toLocaleDateString("pt-BR")}
                              {isOverdue && " ⚠️"}
                            </span>
                            {charge.isRecurring && (
                              <p className="text-xs text-indigo-500 mt-0.5 font-medium">
                                🔄 Renova dia {recDay} todo mês
                              </p>
                            )}
                          </div>
                        </TableTd>
                        <TableTd>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {PAYMENT_LABELS[charge.paymentMethod] ?? charge.paymentMethod}
                          </span>
                        </TableTd>
                        <TableTd>
                          <Badge variant={CHARGE_STATUS_VARIANTS[charge.status]}>
                            {CHARGE_STATUS_LABELS[charge.status]}
                          </Badge>
                        </TableTd>
                        <TableTd>
                          <div className="flex items-center gap-2">
                            <ChargeActions chargeId={charge.id} status={charge.status} />
                            <Link
                              href={`/admin/billing/${charge.id}`}
                              className="text-gray-400 hover:text-indigo-500 transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                          </div>
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
