"use client";

import { useState, type ChangeEvent } from "react";
import { Field, SelectField } from "@/components/veiculos/VeiculoFormFields";
import { vendaLabels } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/format";
import type { StatusVenda } from "@/types";

export interface OpcaoSelect {
  value: string;
  label: string;
}

export interface OpcoesVenda {
  veiculos: OpcaoSelect[];
  clientes: OpcaoSelect[];
  vendedores: OpcaoSelect[];
  vendedorPadraoId?: string;
  custoPorVeiculo: Record<string, number>;
  precoPorVeiculo: Record<string, number>;
}

export interface VendaFieldValues {
  veiculoId?: string;
  clienteId?: string;
  vendedorId?: string;
  data?: string;
  valor?: number;
  status?: StatusVenda;
}

const statusOptions = Object.keys(vendaLabels) as StatusVenda[];

export function VendaFields({
  opcoes,
  defaultValues,
}: {
  opcoes: OpcoesVenda;
  defaultValues?: VendaFieldValues;
}) {
  const [veiculoId, setVeiculoId] = useState(defaultValues?.veiculoId ?? "");
  const [valorTexto, setValorTexto] = useState(
    defaultValues?.valor !== undefined ? String(defaultValues.valor) : "",
  );

  function handleVeiculoChange(event: ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value;
    setVeiculoId(id);
    if (valorTexto === "") {
      const preco = opcoes.precoPorVeiculo[id];
      if (preco !== undefined) setValorTexto(String(preco));
    }
  }

  const custoVeiculo = veiculoId ? opcoes.custoPorVeiculo[veiculoId] : undefined;
  const valorNumero = Number(valorTexto);
  const lucroEstimado =
    custoVeiculo !== undefined && valorTexto !== "" && Number.isFinite(valorNumero)
      ? valorNumero - custoVeiculo
      : null;

  return (
    <>
      <SelectField
        label="Veículo"
        name="veiculo_id"
        required
        placeholder="Selecione o veículo"
        value={veiculoId}
        onChange={handleVeiculoChange}
        options={opcoes.veiculos}
      />
      {opcoes.veiculos.length === 0 && (
        <p className="-mt-2 text-xs text-muted">Nenhum veículo disponível para venda.</p>
      )}

      <SelectField
        label="Cliente"
        name="cliente_id"
        required
        placeholder="Selecione o cliente"
        defaultValue={defaultValues?.clienteId}
        options={opcoes.clientes}
      />
      {opcoes.clientes.length === 0 && (
        <p className="-mt-2 text-xs text-muted">Cadastre um cliente antes de registrar a venda.</p>
      )}

      <SelectField
        label="Vendedor"
        name="vendedor_id"
        required
        placeholder="Selecione o vendedor"
        defaultValue={defaultValues?.vendedorId ?? opcoes.vendedorPadraoId}
        options={opcoes.vendedores}
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Data"
          name="data"
          type="date"
          required
          defaultValue={defaultValues?.data ?? new Date().toLocaleDateString("sv-SE")}
        />
        <SelectField
          label="Status"
          name="status"
          defaultValue={defaultValues?.status ?? "concluida"}
          options={statusOptions.map((s) => ({ value: s, label: vendaLabels[s] }))}
        />
      </div>

      <Field
        label="Valor (R$)"
        name="valor"
        type="number"
        step="0.01"
        min="0"
        required
        value={valorTexto}
        onChange={(event) => setValorTexto(event.target.value)}
      />

      <div className="space-y-1 rounded-lg border border-border bg-surface-2 p-3 text-sm">
        <div className="flex justify-between text-muted">
          <span>Custo do veículo (CMV)</span>
          <span>{custoVeiculo !== undefined ? formatCurrency(custoVeiculo) : "—"}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-1 font-medium">
          <span>Lucro estimado</span>
          <span className={lucroEstimado !== null && lucroEstimado < 0 ? "text-red-400" : "text-accent-2"}>
            {lucroEstimado !== null ? formatCurrency(lucroEstimado) : "—"}
          </span>
        </div>
      </div>
    </>
  );
}
