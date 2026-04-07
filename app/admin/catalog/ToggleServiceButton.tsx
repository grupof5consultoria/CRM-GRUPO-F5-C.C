"use client";

import { useState } from "react";
import { toggleServiceAction } from "./actions";
import { Button } from "@/components/ui/Button";

export function ToggleServiceButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleServiceAction(id, isActive);
    setLoading(false);
  }

  return (
    <Button
      size="sm"
      variant={isActive ? "ghost" : "secondary"}
      onClick={handleToggle}
      loading={loading}
    >
      {isActive ? "Desativar" : "Ativar"}
    </Button>
  );
}
