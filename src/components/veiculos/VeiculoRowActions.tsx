import { EditarVeiculoModal } from "@/components/veiculos/EditarVeiculoModal";
import { ExcluirVeiculoButton } from "@/components/veiculos/ExcluirVeiculoButton";
import type { Veiculo } from "@/types";

export function VeiculoRowActions({ veiculo }: { veiculo: Veiculo }) {
  return (
    <div className="flex items-center gap-3">
      <EditarVeiculoModal veiculo={veiculo} />
      <ExcluirVeiculoButton id={veiculo.id} descricao={`${veiculo.marca} ${veiculo.modelo}`} />
    </div>
  );
}
