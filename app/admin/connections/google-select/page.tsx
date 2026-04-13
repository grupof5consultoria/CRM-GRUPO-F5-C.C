"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireInternalAuth } from "@/lib/auth";

export default async function GoogleSelectPage() {
  await requireInternalAuth();

  const cookieStore = await cookies();
  const accountsRaw = cookieStore.get("google_accounts")?.value;
  const clientId    = cookieStore.get("google_client_id")?.value;

  if (!clientId) {
    redirect("/admin/connections?error=google_session_expired");
  }

  const accounts: { id: string; name: string }[] = accountsRaw ? JSON.parse(accountsRaw) : [];

  async function selectAccount(formData: FormData) {
    "use server";
    const selectedId = (formData.get("accountId") as string)?.trim();
    const cId        = formData.get("clientId") as string;

    if (!selectedId) redirect("/admin/connections/google-select");

    await prisma.client.update({
      where: { id: cId },
      data: { googleAdsCustomerId: selectedId.replace(/-/g, "") },
    });

    const cookieStore = await cookies();
    cookieStore.delete("google_accounts");
    cookieStore.delete("google_client_id");

    redirect("/admin/connections?success=google_connected");
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Vincular conta Google Ads</h2>
            <p className="text-xs text-gray-500">Informe o Customer ID da conta deste cliente</p>
          </div>
        </div>

        <form action={selectAccount} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />

          {accounts.length > 0 ? (
            <>
              <p className="text-xs text-gray-500 mb-2">Selecione uma das contas detectadas:</p>
              {accounts.map(acc => (
                <label key={acc.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#2a2a2a] hover:border-red-500/30 hover:bg-red-500/5 cursor-pointer transition-all">
                  <input type="radio" name="accountId" value={acc.id} className="accent-red-500" required />
                  <div>
                    <p className="text-sm font-medium text-white">{acc.name !== acc.id ? acc.name : `Conta ${acc.id}`}</p>
                    <p className="text-xs text-gray-500">ID: {acc.id}</p>
                  </div>
                </label>
              ))}
            </>
          ) : (
            <>
              <p className="text-xs text-gray-400 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5">
                Autorização concluída. Agora informe o <strong className="text-white">Customer ID</strong> da conta Google Ads deste cliente.<br />
                <span className="text-gray-500">Encontre em: Google Ads → canto superior direito (formato: 123-456-7890)</span>
              </p>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Customer ID</label>
                <input
                  name="accountId"
                  placeholder="ex: 123-456-7890"
                  required
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/50"
                />
              </div>
            </>
          )}

          <button type="submit"
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors">
            Vincular conta
          </button>
        </form>
      </div>
    </div>
  );
}
