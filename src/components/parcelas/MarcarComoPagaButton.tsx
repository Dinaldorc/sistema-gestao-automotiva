"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { marcarParcelaComoPaga } from "@/lib/actions/parcelas";

export function MarcarComoPagaButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await marcarParcelaComoPaga(id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <span className="relative">
      <button
        onClick={handleClick}
        disabled={pending}
        className="text-muted hover:text-accent-2 disabled:opacity-50"
        aria-label="Marcar como paga"
        title="Marcar como paga"
      >
        <Check size={16} />
      </button>
      {error && (
        <span className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-surface p-2 text-xs text-red-400 shadow-lg">
          {error}
        </span>
      )}
    </span>
  );
}
