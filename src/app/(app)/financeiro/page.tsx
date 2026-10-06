import { AlertTriangle, Clock, Wallet } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/StatCard";
import { StatusParcelaBadge } from "@/components/ui/StatusBadge";
import { NovaParcelaModal } from "@/components/parcelas/NovaParcelaModal";
import { ParcelaRowActions } from "@/components/parcelas/ParcelaRowActions";
import type { OpcaoVenda } from "@/components/parcelas/ParcelaFormFields";
import { getParcelasDetalhadas, getVendas } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { getUsuarioAtual } from "@/lib/auth";
import type { StatusParcela } from "@/types";

export default async function FinanceiroPage() {
  const [usuario, parcelas, vendas] = await Promise.all([
    getUsuarioAtual(),
    getParcelasDetalhadas(),
    getVendas(),
  ]);

  const hoje = new Date().toLocaleDateString("sv-SE");
  function statusEfetivo(p: { status: StatusParcela; vencimento: string }): StatusParcela {
    if (p.status === "em_aberto" && p.vencimento < hoje) return "atrasada";
    return p.status;
  }

  const aReceber = parcelas.filter((p) => p.status !== "paga").reduce((sum, p) => sum + p.valor, 0);
  const emAberto = parcelas.filter((p) => statusEfetivo(p) === "em_aberto").length;
  const atrasadas = parcelas.filter((p) => statusEfetivo(p) === "atrasada").length;

  const parceladoPorVenda = new Map<string, number>();
  for (const p of parcelas) {
    parceladoPorVenda.set(p.vendaId, (parceladoPorVenda.get(p.vendaId) ?? 0) + p.valor);
  }

  const opcoesVendas: OpcaoVenda[] = vendas
    .filter((v) => v.status !== "cancelada")
    .map((v) => ({ venda: v, restante: v.valor - (parceladoPorVenda.get(v.id) ?? 0) }))
    .filter(({ restante }) => restante > 0.01)
    .map(({ venda, restante }) => ({
      value: venda.id,
      label: `${venda.veiculo?.marca ?? ""} ${venda.veiculo?.modelo ?? ""} — ${venda.cliente?.nome ?? ""} (${formatCurrency(restante)} restante)`,
    }));

  return (
    <>
      <Topbar title="Financeiro" userName={usuario?.nome} userRole={usuario?.papel} />

      <main className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard icon={Wallet} label="A Receber (R$)" value={formatCurrency(aReceber)} />
          <StatCard icon={Clock} label="Parcelas em Aberto" value={String(emAberto)} />
          <StatCard icon={AlertTriangle} label="Parcelas Atrasadas" value={String(atrasadas)} />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{parcelas.length} parcelas registradas</p>
          <NovaParcelaModal vendas={opcoesVendas} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          {parcelas.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">
              Nenhuma parcela cadastrada ainda.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Venda</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Vencimento</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {parcelas.map((parcela) => (
                  <tr key={parcela.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {parcela.venda?.veiculo?.marca} {parcela.venda?.veiculo?.modelo}
                    </td>
                    <td className="px-4 py-3 text-muted">{parcela.venda?.cliente?.nome}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(parcela.vencimento)}</td>
                    <td className="px-4 py-3">{formatCurrency(parcela.valor)}</td>
                    <td className="px-4 py-3">
                      <StatusParcelaBadge status={statusEfetivo(parcela)} />
                    </td>
                    <td className="px-4 py-3">
                      <ParcelaRowActions parcela={parcela} vendas={opcoesVendas} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
