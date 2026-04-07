"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AcceptProposalButton({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    if (!name.trim()) {
      setError("Por favor, informe seu nome.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch(`/api/proposals/${token}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acceptedBy: name }),
    });

    if (res.ok) {
      setDone(true);
    } else {
      setError("Não foi possível aceitar a proposta. Tente novamente.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-lg font-semibold text-green-700">Proposta aceita com sucesso!</p>
        <p className="text-sm text-gray-500 mt-1">Entraremos em contato em breve.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-xs mx-auto">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Seu nome completo"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button className="w-full" size="lg" onClick={handleAccept} loading={loading}>
        Aceitar Proposta
      </Button>
    </div>
  );
}
