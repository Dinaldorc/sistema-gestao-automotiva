import { EditarParcelaModal } from "@/components/parcelas/EditarParcelaModal";
import { MarcarComoPagaButton } from "@/components/parcelas/MarcarComoPagaButton";
import { ExcluirParcelaButton } from "@/components/parcelas/ExcluirParcelaButton";
import type { OpcaoVenda } from "@/components/parcelas/ParcelaFormFields";
import { formatCurrency } from "@/lib/format";
import type { ParcelaDetalhada } from "@/lib/data";

export function ParcelaRowActions({
  parcela,
  vendas,
}: {
  parcela: ParcelaDetalhada;
  vendas: OpcaoVenda[];
}) {
  const descricao = `a parcela de ${formatCurrency(parcela.valor)}`;

  return (
    <div className="flex items-center gap-3">
      {parcela.status !== "paga" && <MarcarComoPagaButton id={parcela.id} />}
      <EditarParcelaModal parcela={parcela} vendas={vendas} />
      <ExcluirParcelaButton id={parcela.id} descricao={descricao} />
    </div>
  );
}
