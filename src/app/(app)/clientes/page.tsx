import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { getClientes, getVendas } from "@/lib/data";
import { getUsuarioAtual } from "@/lib/auth";

export default async function ClientesPage() {
  const [usuario, clientes, vendas] = await Promise.all([
    getUsuarioAtual(),
    getClientes(),
    getVendas(),
  ]);

  return (
    <>
      <Topbar title="Clientes" userName={usuario?.nome} userRole={usuario?.papel} />

      <main className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{clientes.length} clientes cadastrados</p>
          <button className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface-2 hover:opacity-90">
            <Plus size={16} />
            Novo Cliente
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface">
          {clientes.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">
              Nenhum cliente cadastrado ainda.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Telefone</th>
                  <th className="px-5 py-3 font-medium">Documento</th>
                  <th className="px-5 py-3 font-medium">Compras</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => {
                  const totalCompras = vendas.filter((v) => v.cliente?.id === cliente.id).length;
                  return (
                    <tr key={cliente.id} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-3 font-medium">{cliente.nome}</td>
                      <td className="px-5 py-3 text-muted">{cliente.telefone}</td>
                      <td className="px-5 py-3 text-muted">{cliente.documento}</td>
                      <td className="px-5 py-3">{totalCompras}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
