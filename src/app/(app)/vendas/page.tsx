import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatusVendaBadge } from "@/components/ui/StatusBadge";
import { getVendas } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { getUsuarioAtual } from "@/lib/auth";

export default async function VendasPage() {
  const [usuario, vendas] = await Promise.all([getUsuarioAtual(), getVendas()]);

  return (
    <>
      <Topbar title="Vendas" userName={usuario?.nome} userRole={usuario?.papel} />

      <main className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{vendas.length} vendas registradas</p>
          <button className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface-2 hover:opacity-90">
            <Plus size={16} />
            Nova Venda
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface">
          {vendas.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">
              Nenhuma venda registrada ainda.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Veículo</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Vendedor</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Lucro</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => (
                  <tr key={venda.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3 text-muted">#{venda.id.slice(0, 8)}</td>
                    <td className="px-5 py-3 text-muted">{formatDate(venda.data)}</td>
                    <td className="px-5 py-3 font-medium">
                      {venda.veiculo?.marca} {venda.veiculo?.modelo}
                    </td>
                    <td className="px-5 py-3">{venda.cliente?.nome}</td>
                    <td className="px-5 py-3">{venda.vendedor?.nome}</td>
                    <td className="px-5 py-3">{formatCurrency(venda.valor)}</td>
                    <td className="px-5 py-3 text-accent-2">{formatCurrency(venda.lucro)}</td>
                    <td className="px-5 py-3">
                      <StatusVendaBadge status={venda.status} />
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
