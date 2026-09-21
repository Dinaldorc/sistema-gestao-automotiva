import { EditarVeiculoModal } from "@/components/veiculos/EditarVeiculoModal";
import { ExcluirVeiculoButton } from "@/components/veiculos/ExcluirVeiculoButton";
import type { OpcaoFornecedor } from "@/components/veiculos/VeiculoFormFields";
import type { Veiculo } from "@/types";

export function VeiculoRowActions({
  veiculo,
  fornecedores,
}: {
  veiculo: Veiculo;
  fornecedores: OpcaoFornecedor[];
}) {
  return (
    <div className="flex items-center gap-3">
      <EditarVeiculoModal veiculo={veiculo} fornecedores={fornecedores} />
      <ExcluirVeiculoButton id={veiculo.id} descricao={`${veiculo.marca} ${veiculo.modelo}`} />
    </div>
  );
}
