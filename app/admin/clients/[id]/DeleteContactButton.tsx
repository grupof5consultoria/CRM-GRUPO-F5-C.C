"use client";

import { useState } from "react";
import { deleteContactAction } from "../actions";

export function DeleteContactButton({ contactId, clientId }: { contactId: string; clientId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Remover este contato?")) return;
    setLoading(true);
    await deleteContactAction(contactId, clientId);
    setLoading(false);
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50">
      {loading ? "..." : "Remover"}
    </button>
  );
}
