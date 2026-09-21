import { Topbar } from "@/components/layout/Topbar";
import { StatusVeiculoBadge } from "@/components/ui/StatusBadge";
import { NovoVeiculoModal } from "@/components/veiculos/NovoVeiculoModal";
import { VeiculoRowActions } from "@/components/veiculos/VeiculoRowActions";
import { origemLabels } from "@/components/veiculos/VeiculoFormFields";
import { getFornecedores, getVeiculos } from "@/lib/data";
import { diasDesde, formatCurrency, formatDate } from "@/lib/format";
import { getUsuarioAtual } from "@/lib/auth";

export default async function VeiculosPage() {
  const [usuario, veiculos, fornecedores] = await Promise.all([
    getUsuarioAtual(),
    getVeiculos(),
    getFornecedores(),
  ]);

  const opcoesFornecedores = fornecedores.map((f) => ({ value: f.id, label: f.nome }));
  const emEstoque = veiculos.filter((v) => v.status !== "vendido");
  const custoEmEstoque = emEstoque.reduce((sum, v) => sum + v.custoAquisicao, 0);

  return (
    <>
      <Topbar title="Veículos" userName={usuario?.nome} userRole={usuario?.papel} />

      <main className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {emEstoque.length} veículos em estoque · {formatCurrency(custoEmEstoque)} a custo
          </p>
          <NovoVeiculoModal fornecedores={opcoesFornecedores} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          {veiculos.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">
              Nenhum veículo cadastrado ainda.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Veículo</th>
                  <th className="px-4 py-3 font-medium">Origem</th>
                  <th className="px-4 py-3 font-medium">Entrada</th>
                  <th className="px-4 py-3 font-medium">Custo</th>
                  <th className="px-4 py-3 font-medium">Preço de venda</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {veiculos.map((veiculo) => (
                  <tr key={veiculo.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {veiculo.marca} {veiculo.modelo}
                      </p>
                      <p className="text-xs text-muted">
                        {[veiculo.ano, veiculo.combustivel, veiculo.cambio]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{origemLabels[veiculo.origem]}</p>
                      <p className="text-xs text-muted">{veiculo.fornecedorNome ?? "Sem fornecedor"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {veiculo.dataAquisicao ? (
                        <>
                          <p>{formatDate(veiculo.dataAquisicao)}</p>
                          {veiculo.status !== "vendido" && (
                            <p className="text-xs text-muted">
                              {diasDesde(veiculo.dataAquisicao)} dias em estoque
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(veiculo.custoAquisicao)}</td>
                    <td className="px-4 py-3">{formatCurrency(veiculo.valor)}</td>
                    <td className="px-4 py-3">
                      <StatusVeiculoBadge status={veiculo.status} />
                    </td>
                    <td className="px-4 py-3">
                      <VeiculoRowActions veiculo={veiculo} fornecedores={opcoesFornecedores} />
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
