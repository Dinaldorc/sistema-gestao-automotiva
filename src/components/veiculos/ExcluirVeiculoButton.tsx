"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { excluirVeiculo } from "@/lib/actions/veiculos";

export function ExcluirVeiculoButton({
  id,
  descricao,
}: {
  id: string;
  descricao: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(`Excluir ${descricao}? Essa ação não pode ser desfeita.`)) return;

    setError(null);
    startTransition(async () => {
      const result = await excluirVeiculo(id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <span className="relative">
      <button
        onClick={handleClick}
        disabled={pending}
        className="text-muted hover:text-red-400 disabled:opacity-50"
        aria-label="Excluir veículo"
      >
        <Trash2 size={16} />
      </button>
      {error && (
        <span className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-surface p-2 text-xs text-red-400 shadow-lg">
          {error}
        </span>
      )}
    </span>
  );
}
