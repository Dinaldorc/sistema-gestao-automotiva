"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Pencil, X } from "lucide-react";
import { atualizarFornecedor } from "@/lib/actions/fornecedores";
import { FornecedorFields } from "@/components/fornecedores/FornecedorFormFields";
import type { Fornecedor } from "@/types";

export function EditarFornecedorModal({ fornecedor }: { fornecedor: Fornecedor }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await atualizarFornecedor({ error: null, success: false }, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-muted hover:text-foreground"
        aria-label="Editar fornecedor"
      >
        <Pencil size={16} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-full w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Editar Fornecedor</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="hidden" name="id" value={fornecedor.id} />
              <FornecedorFields defaultValues={fornecedor} />

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm text-muted hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface-2 hover:opacity-90 disabled:opacity-50"
                >
                  {pending ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
