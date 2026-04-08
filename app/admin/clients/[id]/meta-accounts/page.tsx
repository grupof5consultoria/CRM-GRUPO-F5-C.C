import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireInternalAuth } from "@/lib/auth";
import { MetaAccountSelect } from "./MetaAccountSelect";

export default async function MetaAccountsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireInternalAuth();
  const { id: clientId } = await params;

  const cookieStore = await cookies();
  const raw = cookieStore.get("meta_pending")?.value;
  if (!raw) redirect(`/admin/clients/${clientId}?meta_error=sessao_expirada`);

  let token = "";
  let accounts: Array<{ id: string; name: string }> = [];
  try {
    const data = JSON.parse(Buffer.from(raw, "base64").toString());
    token    = data.token;
    accounts = data.accounts;
  } catch {
    redirect(`/admin/clients/${clientId}?meta_error=sessao_invalida`);
  }

  return (
    <main className="min-h-screen bg-[#111111] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-3 h-3 rounded-full bg-blue-400" />
          <h1 className="text-lg font-bold text-white">Selecionar Conta Meta Ads</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Encontramos {accounts.length} contas de anúncio. Selecione qual deseja conectar a este cliente.
        </p>
        <MetaAccountSelect clientId={clientId} token={token} accounts={accounts} />
      </div>
    </main>
  );
}
