"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveMetaAccountAction } from "./actions";

interface Props {
  clientId: string;
  token: string;
  accounts: Array<{ id: string; name: string }>;
}

export function MetaAccountSelect({ clientId, token, accounts }: Props) {
  const [selected, setSelected] = useState(accounts[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSave() {
    setLoading(true);
    setError(null);
    const res = await saveMetaAccountAction(clientId, selected.replace("act_", ""), token);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push(`/admin/clients/${clientId}?meta_success=1`);
    }
  }

  return (
    <div className="space-y-3">
      {accounts.map((acc) => (
        <button
          key={acc.id}
          onClick={() => setSelected(acc.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
            selected === acc.id
              ? "border-blue-500/50 bg-blue-500/10 text-white"
              : "border-[#333] bg-[#111] text-gray-400 hover:border-[#444]"
          }`}
        >
          <span className={`w-3 h-3 rounded-full flex-shrink-0 border-2 transition-all ${
            selected === acc.id ? "border-blue-400 bg-blue-400" : "border-gray-600"
          }`} />
          <div>
            <p className="text-sm font-medium">{acc.name}</p>
            <p className="text-xs text-gray-600">{acc.id}</p>
          </div>
        </button>
      ))}

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={loading || !selected}
        className="relative w-full py-3 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all disabled:opacity-50 mt-2"
        style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)" }}
      >
        <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
        <span className="relative">{loading ? "Conectando..." : "Conectar esta conta"}</span>
      </button>
    </div>
  );
}
