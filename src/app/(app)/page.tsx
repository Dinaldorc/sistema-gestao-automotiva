import { Car, DollarSign, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/StatCard";
import { StatusVeiculoBadge, StatusVendaBadge } from "@/components/ui/StatusBadge";
import {
  FaturamentoLineChart,
  VeiculosStatusDonut,
  VendasPorVendedorBarChart,
} from "@/components/dashboard/Charts";
import { getParcelas, getVeiculos, getVendas } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { getUsuarioAtual } from "@/lib/auth";

export default async function DashboardPage() {
  const [usuario, veiculos, vendas, parcelas] = await Promise.all([
    getUsuarioAtual(),
    getVeiculos(),
    getVendas(),
    getParcelas(),
  ]);

  const totalVeiculos = veiculos.length;
  const disponiveis = veiculos.filter((v) => v.status === "disponivel").length;
  const vendidos = veiculos.filter((v) => v.status === "vendido").length;
  const reservados = veiculos.filter((v) => v.status === "reservado").length;
  const manutencao = veiculos.filter((v) => v.status === "manutencao").length;

  const faturamento = vendas.reduce((sum, v) => sum + v.valor, 0);
  const lucro = vendas.reduce((sum, v) => sum + v.lucro, 0);
  const aReceber = parcelas
    .filter((p) => p.status !== "paga")
    .reduce((sum, p) => sum + p.valor, 0);

  const totaisPorVendedor = new Map<string, number>();
  for (const venda of vendas) {
    const nome = venda.vendedor?.nome.split(" ")[0] ?? "Sem vendedor";
    totaisPorVendedor.set(nome, (totaisPorVendedor.get(nome) ?? 0) + venda.valor);
  }
  const vendasPorVendedor = Array.from(totaisPorVendedor, ([nome, total]) => ({ nome, total })).sort(
    (a, b) => b.total - a.total,
  );

  const totaisPorData = new Map<string, number>();
  for (const venda of vendas) {
    totaisPorData.set(venda.data, (totaisPorData.get(venda.data) ?? 0) + venda.valor);
  }
  const datasOrdenadas = Array.from(totaisPorData.keys()).sort();
  let acumulado = 0;
  const faturamentoPorPeriodo = datasOrdenadas.map((data) => {
    acumulado += totaisPorData.get(data)!;
    return { data: formatDate(data), valor: acumulado };
  });

  const statusData = [
    { label: "Disponíveis", value: disponiveis, color: "#22d3ee" },
    { label: "Vendidos", value: vendidos, color: "#34d399" },
    { label: "Em Manutenção", value: manutencao, color: "#fbbf24" },
    { label: "Reservados", value: reservados, color: "#a78bfa" },
  ];

  return (
    <>
      <Topbar title="Dashboard" userName={usuario?.nome} userRole={usuario?.papel} />

      <main className="flex-1 space-y-6 overflow-y-auto p-6">
        <div>
          <h2 className="text-lg font-semibold">Olá, {usuario?.nome ?? "Administrador"}! 👋</h2>
          <p className="text-sm text-muted">Aqui está o resumo geral do seu negócio.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard icon={Car} label="Total de Veículos" value={String(totalVeiculos)} hint={`${disponiveis} disponíveis`} />
          <StatCard icon={ShoppingCart} label="Vendas no Período" value={String(vendas.length)} />
          <StatCard icon={DollarSign} label="Faturamento (R$)" value={formatCurrency(faturamento)} />
          <StatCard icon={TrendingUp} label="Lucro Líquido (R$)" value={formatCurrency(lucro)} />
          <StatCard icon={Wallet} label="A Receber (R$)" value={formatCurrency(aReceber)} hint={`${parcelas.length} parcelas em aberto`} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-4 text-sm font-semibold">Veículos por Status</h3>
            {totalVeiculos === 0 ? (
              <p className="text-sm text-muted">Sem veículos cadastrados ainda.</p>
            ) : (
              <VeiculosStatusDonut data={statusData} />
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-4 text-sm font-semibold">Faturamento por Período</h3>
            {faturamentoPorPeriodo.length === 0 ? (
              <p className="text-sm text-muted">Sem vendas registradas ainda.</p>
            ) : (
              <FaturamentoLineChart data={faturamentoPorPeriodo} />
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-4 text-sm font-semibold">Vendas por Vendedor</h3>
            {vendasPorVendedor.length === 0 ? (
              <p className="text-sm text-muted">Sem vendas registradas ainda.</p>
            ) : (
              <VendasPorVendedorBarChart data={vendasPorVendedor} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-4 text-sm font-semibold">Últimas Vendas</h3>
            {vendas.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma venda registrada ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-muted">
                      <th className="pb-2 pr-3 font-medium">ID</th>
                      <th className="pb-2 pr-3 font-medium">Veículo</th>
                      <th className="pb-2 pr-3 font-medium">Cliente</th>
                      <th className="pb-2 pr-3 font-medium">Valor</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendas.slice(0, 5).map((venda) => (
                      <tr key={venda.id} className="border-t border-border/60">
                        <td className="py-2 pr-3 text-muted">#{venda.id.slice(0, 8)}</td>
                        <td className="py-2 pr-3">
                          {venda.veiculo?.marca} {venda.veiculo?.modelo}
                        </td>
                        <td className="py-2 pr-3">{venda.cliente?.nome}</td>
                        <td className="py-2 pr-3">{formatCurrency(venda.valor)}</td>
                        <td className="py-2">
                          <StatusVendaBadge status={venda.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-4 text-sm font-semibold">Veículos em Destaque</h3>
            {veiculos.length === 0 ? (
              <p className="text-sm text-muted">Nenhum veículo cadastrado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-muted">
                      <th className="pb-2 pr-3 font-medium">Veículo</th>
                      <th className="pb-2 pr-3 font-medium">Ano</th>
                      <th className="pb-2 pr-3 font-medium">Valor</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veiculos
                      .filter((v) => v.status !== "vendido")
                      .slice(0, 5)
                      .map((veiculo) => (
                        <tr key={veiculo.id} className="border-t border-border/60">
                          <td className="py-2 pr-3">
                            {veiculo.marca} {veiculo.modelo}
                          </td>
                          <td className="py-2 pr-3 text-muted">{veiculo.ano}</td>
                          <td className="py-2 pr-3">{formatCurrency(veiculo.valor)}</td>
                          <td className="py-2">
                            <StatusVeiculoBadge status={veiculo.status} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <p className="pb-2 text-center text-xs text-muted">
          © 2025 Campos Tecnologia. Todos os direitos reservados.
        </p>
      </main>
    </>
  );
}
