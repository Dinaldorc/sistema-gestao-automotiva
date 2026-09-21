import { Field, SelectField } from "@/components/veiculos/VeiculoFormFields";
import { vendaLabels } from "@/components/ui/StatusBadge";
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
}

export interface VendaFieldValues {
  veiculoId?: string;
  clienteId?: string;
  vendedorId?: string;
  data?: string;
  valor?: number;
  lucro?: number;
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
  return (
    <>
      <SelectField
        label="Veículo"
        name="veiculo_id"
        required
        placeholder="Selecione o veículo"
        defaultValue={defaultValues?.veiculoId}
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

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Valor (R$)"
          name="valor"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={defaultValues?.valor}
        />
        <Field
          label="Lucro (R$)"
          name="lucro"
          type="number"
          step="0.01"
          defaultValue={defaultValues?.lucro ?? 0}
        />
      </div>
    </>
  );
}
