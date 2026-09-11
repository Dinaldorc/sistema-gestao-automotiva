"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { criarVeiculo, type CriarVeiculoState } from "@/lib/actions/veiculos";
import { veiculoLabels } from "@/components/ui/StatusBadge";
import type { StatusVeiculo } from "@/types";

const initialState: CriarVeiculoState = { error: null, success: false };

const combustiveis = ["Flex", "Gasolina", "Diesel", "Elétrico", "Híbrido"];
const cambios = ["Manual", "Automático", "CVT"];
const statusOptions = Object.keys(veiculoLabels) as StatusVeiculo[];

function Field({
  label,
  name,
  type = "text",
  required,
  step,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  min?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        step={step}
        min={min}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function NovoVeiculoModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(criarVeiculo, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface-2 hover:opacity-90"
      >
        <Plus size={16} />
        Novo Veículo
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-surface p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Novo Veículo</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <form ref={formRef} action={formAction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Marca" name="marca" required />
                <Field label="Modelo" name="modelo" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Ano" name="ano" type="number" min="1900" required />
                <Field label="Valor (R$)" name="valor" type="number" step="0.01" min="0" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Combustível"
                  name="combustivel"
                  options={combustiveis.map((c) => ({ value: c, label: c }))}
                />
                <SelectField
                  label="Câmbio"
                  name="cambio"
                  options={cambios.map((c) => ({ value: c, label: c }))}
                />
              </div>

              <SelectField
                label="Status"
                name="status"
                defaultValue="disponivel"
                options={statusOptions.map((s) => ({ value: s, label: veiculoLabels[s] }))}
              />

              {state.error && <p className="text-sm text-red-400">{state.error}</p>}

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
