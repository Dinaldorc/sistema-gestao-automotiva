import { EditarFornecedorModal } from "@/components/fornecedores/EditarFornecedorModal";
import { ExcluirFornecedorButton } from "@/components/fornecedores/ExcluirFornecedorButton";
import type { Fornecedor } from "@/types";

export function FornecedorRowActions({ fornecedor }: { fornecedor: Fornecedor }) {
  return (
    <div className="flex items-center gap-3">
      <EditarFornecedorModal fornecedor={fornecedor} />
      <ExcluirFornecedorButton id={fornecedor.id} descricao={fornecedor.nome} />
    </div>
  );
}
