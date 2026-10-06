"use client";

import { useState, useTransition, type FormEvent } from "react";
import { atualizarMeuPerfil } from "@/lib/actions/configuracoes";
import { Field } from "@/components/veiculos/VeiculoFormFields";

export function PerfilForm({ nomeAtual }: { nomeAtual: string }) {
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSucesso(false);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await atualizarMeuPerfil({ error: null, success: false }, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSucesso(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field label="Nome" name="nome" required defaultValue={nomeAtual} />

      {error && <p className="text-sm text-red-400">{error}</p>}
      {sucesso && <p className="text-sm text-accent-2">Perfil atualizado.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface-2 hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
