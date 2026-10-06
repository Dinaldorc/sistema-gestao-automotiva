import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { AtivoBadge, PapelBadge } from "@/components/ui/StatusBadge";
import { EditarVendedorModal } from "@/components/vendedores/EditarVendedorModal";
import { getVendas, getVendedores } from "@/lib/data";
import { getUsuarioAtual } from "@/lib/auth";

export default async function VendedoresPage() {
  const [usuario, vendedores, vendas] = await Promise.all([
    getUsuarioAtual(),
    getVendedores(),
    getVendas(),
  ]);

  const vendasPorVendedor = new Map<string, number>();
  for (const venda of vendas) {
    vendasPorVendedor.set(venda.vendedorId, (vendasPorVendedor.get(venda.vendedorId) ?? 0) + 1);
  }

  const souAdmin = usuario?.papel === "admin";

  return (
    <>
      <Topbar title="Vendedores" userName={usuario?.nome} userRole={usuario?.papel} />

      <main className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{vendedores.length} pessoas com acesso ao sistema</p>
          <Link
            href="/cadastro"
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-white/5"
          >
            Convidar vendedor
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Papel</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Vendas realizadas</th>
                {souAdmin && <th className="px-5 py-3 font-medium">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {vendedores.map((vendedor) => (
                <tr key={vendedor.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 font-medium">
                    {vendedor.nome}
                    {vendedor.id === usuario?.id && (
                      <span className="ml-2 text-xs text-muted">(você)</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <PapelBadge papel={vendedor.papel} />
                  </td>
                  <td className="px-5 py-3">
                    <AtivoBadge ativo={vendedor.ativo} />
                  </td>
                  <td className="px-5 py-3 text-muted">{vendasPorVendedor.get(vendedor.id) ?? 0}</td>
                  {souAdmin && (
                    <td className="px-5 py-3">
                      {vendedor.id !== usuario?.id && <EditarVendedorModal vendedor={vendedor} />}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted">
          Para adicionar alguém novo, compartilhe o link{" "}
          <Link href="/cadastro" className="text-accent hover:underline">
            /cadastro
          </Link>
          . A pessoa entra automaticamente como vendedor da sua revendedora.
        </p>
      </main>
    </>
  );
}
