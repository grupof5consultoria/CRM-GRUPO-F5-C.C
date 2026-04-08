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
    <main className="flex-1 p-6 bg-[#111111] min-h-screen max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-white">Minha Conta</h1>

      {/* Dados da empresa */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Dados Cadastrais</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Nome / Empresa</p>
            <p className="font-medium text-gray-200">{account.name}</p>
          </div>
          {account.document && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">CPF / CNPJ</p>
              <p className="font-medium text-gray-200">{account.document}</p>
            </div>
          )}
          {account.email && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Email</p>
              <p className="font-medium text-gray-200">{account.email}</p>
            </div>
          )}
          {account.phone && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Telefone</p>
              <p className="font-medium text-gray-200">{account.phone}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Cliente desde</p>
            <p className="font-medium text-gray-200">
              {new Date(account.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </div>

      {/* Usuário logado */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-6 space-y-3">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Acesso ao Portal</h2>
        <div className="text-sm space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Nome</p>
            <p className="font-medium text-gray-200">{session.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Email de acesso</p>
            <p className="font-medium text-gray-200">{session.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Perfil</p>
            <p className="font-medium text-gray-200 capitalize">{session.role.replace("client_", "").replace("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* Contatos */}
      {account.contacts.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#262626] p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contatos da Empresa</h2>
          <div className="space-y-3">
            {account.contacts.map((c) => (
              <div key={c.id} className="flex items-start justify-between text-sm py-2.5 border-b border-[#262626] last:border-0">
                <div>
                  <p className="font-medium text-gray-200">
                    {c.name}
                    {c.isPrimary && <span className="ml-2 text-xs text-violet-400">(principal)</span>}
                  </p>
                  {c.role && <p className="text-xs text-gray-600 mt-0.5">{c.role}</p>}
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

      <p className="text-xs text-gray-600 text-center">
        Para atualizar seus dados, entre em contato com nossa equipe.
      </p>
    </main>
  );
}
