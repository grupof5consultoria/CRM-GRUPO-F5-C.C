import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPortalAccount } from "@/services/portal";

export const metadata = { title: "Minha Conta | Portal do Cliente" };

export default async function PortalAccountPage() {
  const session = await getSession();
  if (!session?.clientId) redirect("/portal/login");

  const account = await getPortalAccount(session.clientId);
  if (!account) redirect("/portal/login");

  return (
    <main className="flex-1 p-6 max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Minha Conta</h1>

      {/* Dados da empresa */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Dados Cadastrais</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Nome / Empresa</p>
            <p className="font-medium text-gray-900 mt-0.5">{account.name}</p>
          </div>
          {account.document && (
            <div>
              <p className="text-gray-500">CPF / CNPJ</p>
              <p className="font-medium text-gray-900 mt-0.5">{account.document}</p>
            </div>
          )}
          {account.email && (
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-900 mt-0.5">{account.email}</p>
            </div>
          )}
          {account.phone && (
            <div>
              <p className="text-gray-500">Telefone</p>
              <p className="font-medium text-gray-900 mt-0.5">{account.phone}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Cliente desde</p>
            <p className="font-medium text-gray-900 mt-0.5">
              {new Date(account.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </div>

      {/* Usuário logado */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Acesso ao Portal</h2>
        <div className="text-sm space-y-2">
          <div>
            <p className="text-gray-500">Nome</p>
            <p className="font-medium text-gray-900">{session.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Email de acesso</p>
            <p className="font-medium text-gray-900">{session.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Perfil</p>
            <p className="font-medium text-gray-900 capitalize">{session.role.replace("client_", "").replace("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* Contatos */}
      {account.contacts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Contatos da Empresa</h2>
          <div className="space-y-3">
            {account.contacts.map((c) => (
              <div key={c.id} className="flex items-start justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">
                    {c.name}
                    {c.isPrimary && <span className="ml-2 text-xs text-blue-600">(principal)</span>}
                  </p>
                  {c.role && <p className="text-xs text-gray-500">{c.role}</p>}
                </div>
                <div className="text-right text-xs text-gray-500 space-y-0.5">
                  {c.email && <p>{c.email}</p>}
                  {c.phone && <p>{c.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Para atualizar seus dados, entre em contato com nossa equipe.
      </p>
    </main>
  );
}
