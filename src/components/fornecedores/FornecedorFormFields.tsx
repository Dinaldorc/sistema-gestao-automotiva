import { Field, SelectField } from "@/components/veiculos/VeiculoFormFields";
import type { TipoFornecedor } from "@/types";

export const tipoFornecedorLabels: Record<TipoFornecedor, string> = {
  pessoa_fisica: "Pessoa Física",
  revendedora: "Revendedora",
};

const tipoOptions = (Object.keys(tipoFornecedorLabels) as TipoFornecedor[]).map((t) => ({
  value: t,
  label: tipoFornecedorLabels[t],
}));

export interface FornecedorFieldValues {
  nome?: string;
  tipo?: TipoFornecedor;
  documento?: string;
  telefone?: string;
}

export function FornecedorFields({ defaultValues }: { defaultValues?: FornecedorFieldValues }) {
  return (
    <>
      <Field label="Nome" name="nome" required defaultValue={defaultValues?.nome} />
      <SelectField
        label="Tipo"
        name="tipo"
        defaultValue={defaultValues?.tipo ?? "pessoa_fisica"}
        options={tipoOptions}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="CPF/CNPJ" name="documento" defaultValue={defaultValues?.documento} />
        <Field label="Telefone" name="telefone" type="tel" defaultValue={defaultValues?.telefone} />
      </div>
    </>
  );
}
