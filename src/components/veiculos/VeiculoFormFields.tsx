import { veiculoLabels } from "@/components/ui/StatusBadge";
import type { OrigemVeiculo, StatusVeiculo } from "@/types";

export const combustiveis = ["Flex", "Gasolina", "Diesel", "Elétrico", "Híbrido"];
export const cambios = ["Manual", "Automático", "CVT"];
export const statusOptions = Object.keys(veiculoLabels) as StatusVeiculo[];

export const origemLabels: Record<OrigemVeiculo, string> = {
  compra: "Compra",
  troca: "Troca",
  entrada: "Entrada",
};
const origemOptions = (Object.keys(origemLabels) as OrigemVeiculo[]).map((o) => ({
  value: o,
  label: origemLabels[o],
}));

export interface OpcaoFornecedor {
  value: string;
  label: string;
}

export function Field({
  label,
  name,
  type = "text",
  required,
  step,
  min,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  min?: string;
  defaultValue?: string | number;
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
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? (placeholder ? "" : undefined)}
        required={required}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export interface VeiculoFieldValues {
  marca?: string;
  modelo?: string;
  ano?: number;
  valor?: number;
  combustivel?: string;
  cambio?: string;
  status?: StatusVeiculo;
  fornecedorId?: string | null;
  origem?: OrigemVeiculo;
  custoAquisicao?: number;
  dataAquisicao?: string | null;
}

export function VeiculoFields({
  fornecedores,
  defaultValues,
}: {
  fornecedores: OpcaoFornecedor[];
  defaultValues?: VeiculoFieldValues;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Marca" name="marca" required defaultValue={defaultValues?.marca} />
        <Field label="Modelo" name="modelo" required defaultValue={defaultValues?.modelo} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Ano"
          name="ano"
          type="number"
          min="1900"
          required
          defaultValue={defaultValues?.ano}
        />
        <Field
          label="Preço de venda (R$)"
          name="valor"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={defaultValues?.valor}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Combustível"
          name="combustivel"
          defaultValue={defaultValues?.combustivel}
          options={combustiveis.map((c) => ({ value: c, label: c }))}
        />
        <SelectField
          label="Câmbio"
          name="cambio"
          defaultValue={defaultValues?.cambio}
          options={cambios.map((c) => ({ value: c, label: c }))}
        />
      </div>

      <SelectField
        label="Status"
        name="status"
        defaultValue={defaultValues?.status ?? "disponivel"}
        options={statusOptions.map((s) => ({ value: s, label: veiculoLabels[s] }))}
      />

      <p className="pt-1 text-xs font-medium uppercase tracking-wide text-muted">Aquisição</p>

      <SelectField
        label="Fornecedor"
        name="fornecedor_id"
        required
        placeholder="Selecione o fornecedor"
        defaultValue={defaultValues?.fornecedorId ?? undefined}
        options={fornecedores}
      />
      {fornecedores.length === 0 && (
        <p className="-mt-2 text-xs text-muted">Cadastre um fornecedor antes de registrar o veículo.</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Origem"
          name="origem"
          defaultValue={defaultValues?.origem ?? "compra"}
          options={origemOptions}
        />
        <Field
          label="Data da aquisição"
          name="data_aquisicao"
          type="date"
          required
          defaultValue={defaultValues?.dataAquisicao ?? new Date().toLocaleDateString("sv-SE")}
        />
      </div>

      <Field
        label="Custo de aquisição (R$)"
        name="custo_aquisicao"
        type="number"
        step="0.01"
        min="0"
        required
        defaultValue={defaultValues?.custoAquisicao}
      />
    </>
  );
}
