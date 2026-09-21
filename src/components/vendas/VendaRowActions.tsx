import { EditarVendaModal } from "@/components/vendas/EditarVendaModal";
import { ExcluirVendaButton } from "@/components/vendas/ExcluirVendaButton";
import type { OpcoesVenda } from "@/components/vendas/VendaFormFields";
import type { VendaDetalhada } from "@/lib/data";

export function VendaRowActions({
  venda,
  opcoes,
}: {
  venda: VendaDetalhada;
  opcoes: OpcoesVenda;
}) {
  const descricao = `a venda de ${venda.veiculo?.marca ?? ""} ${venda.veiculo?.modelo ?? ""}`.trim();

  return (
    <div className="flex items-center gap-3">
      <EditarVendaModal venda={venda} opcoes={opcoes} />
      <ExcluirVendaButton id={venda.id} descricao={descricao} />
    </div>
  );
}
