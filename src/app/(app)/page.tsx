import { Car, DollarSign, Receipt, ShoppingCart, TrendingUp, Wallet, Warehouse } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/StatCard";
import { StatusVeiculoBadge, StatusVendaBadge } from "@/components/ui/StatusBadge";
import {
  FaturamentoLineChart,
  VeiculosStatusDonut,
  VendasPorVendedorBarChart,
} from "@/components/dashboard/Charts";
import { getCustosVeiculo, getParcelas, getVeiculos, getVendas } from "@/lib/data";
import { custoTotalVeiculo } from "@/lib/custos";
import { formatCurrency, formatDate } from "@/lib/format";
import { getUsuarioAtual } from "@/lib/auth";
import type { CustoVeiculo } from "@/types";

export default async function DashboardPage() {
  const [usuario, veiculos, vendas, parcelas, custos] = await Promise.all([
    getUsuarioAtual(),
    getVeiculos(),
    getVendas(),
    getParcelas(),
    getCustosVeiculo(),
  ]);

  const custosPorVeiculo = new Map<string, CustoVeiculo[]>();
  for (const custo of custos) {
    const lista = custosPorVeiculo.get(custo.veiculoId) ?? [];
    lista.push(custo);
    custosPorVeiculo.set(custo.veiculoId, lista);
  }

  const totalVeiculos = veiculos.length;
  const disponiveis = veiculos.filter((v) => v.status === "disponivel").length;
  const vendidos = veiculos.filter((v) => v.status === "vendido").length;
  const reservados = veiculos.filter((v) => v.status === "reservado").length;
  const manutencao = veiculos.filter((v) => v.status === "manutencao").length;

  const emEstoque = veiculos.filter((v) => v.status !== "vendido");
  const estoqueACusto = emEstoque.reduce(
    (sum, v) => sum + custoTotalVeiculo(v.custoAquisicao, custosPorVeiculo.get(v.id) ?? []),
    0,
  );

  // Vendas canceladas não geram receita nem consomem estoque, então ficam
  // fora dos indicadores financeiros (mas continuam aparecendo no histórico).
  const vendasValidas = vendas.filter((v) => v.status !== "cancelada");
  const receitaBruta = vendasValidas.reduce((sum, v) => sum + v.valor, 0);
  const lucroBruto = vendasValidas.reduce((sum, v) => sum + v.lucro, 0);
  const cmv = receitaBruta - lucroBruto;
  const margemBruta = receitaBruta > 0 ? (lucroBruto / receitaBruta) * 100 : 0;

  const aReceber = parcelas
    .filter((p) => p.status !== "paga")
    .reduce((sum, p) => sum + p.valor, 0);

  const totaisPorVendedor = new Map<string, number>();
  for (const venda of vendasValidas) {
    const nome = venda.vendedor?.nome.split(" ")[0] ?? "Sem vendedor";
    totaisPorVendedor.set(nome, (totaisPorVendedor.get(nome) ?? 0) + venda.valor);
  }
  const vendasPorVendedor = Array.from(totaisPorVendedor, ([nome, total]) => ({ nome, total })).sort(
    (a, b) => b.total - a.total,
  );

  const totaisPorData = new Map<string, number>();
  for (const venda of vendasValidas) {
    totaisPorData.set(venda.data, (totaisPorData.get(venda.data) ?? 0) + venda.valor);
  }
  const datasOrdenadas = Array.from(totaisPorData.keys()).sort();
  const faturamentoPorPeriodo = datasOrdenadas.reduce<{ data: string; valor: number }[]>(
    (acumulado, data) => {
      const anterior = acumulado.at(-1)?.valor ?? 0;
      acumulado.push({ data: formatDate(data), valor: anterior + totaisPorData.get(data)! });
      return acumulado;
    },
    [],
  );

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

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard icon={Car} label="Total de Veículos" value={String(totalVeiculos)} hint={`${disponiveis} disponíveis`} />
          <StatCard icon={ShoppingCart} label="Vendas no Período" value={String(vendasValidas.length)} />
          <StatCard icon={Wallet} label="A Receber (R$)" value={formatCurrency(aReceber)} hint={`${parcelas.length} parcelas em aberto`} />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted">Resumo Financeiro</h3>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={DollarSign} label="Receita Bruta (R$)" value={formatCurrency(receitaBruta)} />
            <StatCard icon={Receipt} label="CMV (R$)" value={formatCurrency(cmv)} hint="Custo dos veículos vendidos" />
            <StatCard
              icon={TrendingUp}
              label="Lucro Bruto (R$)"
              value={formatCurrency(lucroBruto)}
              hint={`${margemBruta.toFixed(1)}% de margem`}
            />
            <StatCard
              icon={Warehouse}
              label="Estoque a Custo (R$)"
              value={formatCurrency(estoqueACusto)}
              hint={`${emEstoque.length} veículos em estoque`}
            />
          </div>
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
