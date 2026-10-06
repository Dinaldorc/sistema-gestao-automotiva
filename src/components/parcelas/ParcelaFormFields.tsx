import { Field, SelectField } from "@/components/veiculos/VeiculoFormFields";
import { parcelaLabels } from "@/components/ui/StatusBadge";
import type { StatusParcela } from "@/types";

export interface OpcaoVenda {
  value: string;
  label: string;
}

const statusOptions = Object.keys(parcelaLabels) as StatusParcela[];

export interface ParcelaFieldValues {
  vendaId?: string;
  valor?: number;
  vencimento?: string;
  status?: StatusParcela;
}

export function ParcelaFields({
  vendas,
  defaultValues,
}: {
  vendas: OpcaoVenda[];
  defaultValues?: ParcelaFieldValues;
}) {
  return (
    <>
      <SelectField
        label="Venda"
        name="venda_id"
        required
        placeholder="Selecione a venda"
        defaultValue={defaultValues?.vendaId}
        options={vendas}
      />
      {vendas.length === 0 && (
        <p className="-mt-2 text-xs text-muted">Nenhuma venda com saldo para parcelar.</p>
      )}

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
          label="Vencimento"
          name="vencimento"
          type="date"
          required
          defaultValue={defaultValues?.vencimento}
        />
      </div>

      <SelectField
        label="Status"
        name="status"
        defaultValue={defaultValues?.status ?? "em_aberto"}
        options={statusOptions.map((s) => ({ value: s, label: parcelaLabels[s] }))}
      />
    </>
  );
}
