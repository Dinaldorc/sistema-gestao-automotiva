import { Field } from "@/components/veiculos/VeiculoFormFields";

export interface ClienteFieldValues {
  nome?: string;
  telefone?: string;
  documento?: string;
}

export function ClienteFields({ defaultValues }: { defaultValues?: ClienteFieldValues }) {
  return (
    <>
      <Field label="Nome" name="nome" required defaultValue={defaultValues?.nome} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefone" name="telefone" type="tel" defaultValue={defaultValues?.telefone} />
        <Field label="Documento (CPF/CNPJ)" name="documento" defaultValue={defaultValues?.documento} />
      </div>
    </>
  );
}
