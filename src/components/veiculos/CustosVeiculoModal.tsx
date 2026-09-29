"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { Receipt, Trash2, X } from "lucide-react";
import { adicionarCusto, excluirCusto } from "@/lib/actions/custos";
import { Field } from "@/components/veiculos/VeiculoFormFields";
import { custoTotalVeiculo, somaCustosExtras } from "@/lib/custos";
import { formatCurrency, formatDate } from "@/lib/format";
import type { CustoVeiculo, Veiculo } from "@/types";

export function CustosVeiculoModal({
  veiculo,
  custos,
}: {
  veiculo: Veiculo;
  custos: CustoVeiculo[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await adicionarCusto({ error: null, success: false }, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Excluir este custo?")) return;
    setError(null);
    startTransition(async () => {
      const result = await excluirCusto(id);
      if (result.error) setError(result.error);
    });
  }

  const extras = somaCustosExtras(custos);
  const total = custoTotalVeiculo(veiculo.custoAquisicao, custos);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-muted hover:text-foreground"
        aria-label="Custos do veículo"
      >
        <Receipt size={16} />
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
              <h2 className="text-base font-semibold">
                Custos — {veiculo.marca} {veiculo.modelo}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 space-y-1 rounded-lg border border-border bg-surface-2 p-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Aquisição</span>
                <span>{formatCurrency(veiculo.custoAquisicao)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Custos extras</span>
                <span>{formatCurrency(extras)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-medium">
                <span>Custo total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {custos.length > 0 && (
              <ul className="mb-4 space-y-2">
                {custos.map((custo) => (
                  <li
                    key={custo.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                  >
                    <div>
                      <p>{custo.descricao}</p>
                      <p className="text-xs text-muted">{formatDate(custo.data)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{formatCurrency(custo.valor)}</span>
                      <button
                        onClick={() => handleDelete(custo.id)}
                        disabled={pending}
                        className="text-muted hover:text-red-400 disabled:opacity-50"
                        aria-label="Excluir custo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form ref={formRef} onSubmit={handleAdd} className="space-y-3 border-t border-border pt-4">
              <input type="hidden" name="veiculo_id" value={veiculo.id} />
              <Field label="Descrição" name="descricao" required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Valor (R$)" name="valor" type="number" step="0.01" min="0" required />
                <Field
                  label="Data"
                  name="data"
                  type="date"
                  required
                  defaultValue={new Date().toLocaleDateString("sv-SE")}
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm text-muted hover:bg-white/5"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface-2 hover:opacity-90 disabled:opacity-50"
                >
                  {pending ? "Salvando..." : "Adicionar custo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
