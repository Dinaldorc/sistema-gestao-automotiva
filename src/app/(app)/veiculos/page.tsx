import { Topbar } from "@/components/layout/Topbar";
import { StatusVeiculoBadge } from "@/components/ui/StatusBadge";
import { NovoVeiculoModal } from "@/components/veiculos/NovoVeiculoModal";
import { VeiculoRowActions } from "@/components/veiculos/VeiculoRowActions";
import { getVeiculos } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { getUsuarioAtual } from "@/lib/auth";

export default async function VeiculosPage() {
  const [usuario, veiculos] = await Promise.all([getUsuarioAtual(), getVeiculos()]);

  return (
    <>
      <Topbar title="Veículos" userName={usuario?.nome} userRole={usuario?.papel} />

      <main className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{veiculos.length} veículos no estoque</p>
          <NovoVeiculoModal />
        </div>

        <div className="rounded-xl border border-border bg-surface">
          {veiculos.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">
              Nenhum veículo cadastrado ainda.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Veículo</th>
                  <th className="px-5 py-3 font-medium">Ano</th>
                  <th className="px-5 py-3 font-medium">Combustível</th>
                  <th className="px-5 py-3 font-medium">Câmbio</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {veiculos.map((veiculo) => (
                  <tr key={veiculo.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3 font-medium">
                      {veiculo.marca} {veiculo.modelo}
                    </td>
                    <td className="px-5 py-3 text-muted">{veiculo.ano}</td>
                    <td className="px-5 py-3 text-muted">{veiculo.combustivel}</td>
                    <td className="px-5 py-3 text-muted">{veiculo.cambio}</td>
                    <td className="px-5 py-3">{formatCurrency(veiculo.valor)}</td>
                    <td className="px-5 py-3">
                      <StatusVeiculoBadge status={veiculo.status} />
                    </td>
                    <td className="px-5 py-3">
                      <VeiculoRowActions veiculo={veiculo} />
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
