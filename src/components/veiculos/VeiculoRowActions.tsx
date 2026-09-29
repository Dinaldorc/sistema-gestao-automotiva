import { EditarVeiculoModal } from "@/components/veiculos/EditarVeiculoModal";
import { ExcluirVeiculoButton } from "@/components/veiculos/ExcluirVeiculoButton";
import { CustosVeiculoModal } from "@/components/veiculos/CustosVeiculoModal";
import type { OpcaoFornecedor } from "@/components/veiculos/VeiculoFormFields";
import type { CustoVeiculo, Veiculo } from "@/types";

export function VeiculoRowActions({
  veiculo,
  fornecedores,
  custos,
}: {
  veiculo: Veiculo;
  fornecedores: OpcaoFornecedor[];
  custos: CustoVeiculo[];
}) {
  return (
    <div className="flex items-center gap-3">
      <CustosVeiculoModal veiculo={veiculo} custos={custos} />
      <EditarVeiculoModal veiculo={veiculo} fornecedores={fornecedores} />
      <ExcluirVeiculoButton id={veiculo.id} descricao={`${veiculo.marca} ${veiculo.modelo}`} />
    </div>
  );
}
