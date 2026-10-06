import { Topbar } from "@/components/layout/Topbar";
import { RelatorioVendas } from "@/components/relatorios/RelatorioVendas";
import { getVendas } from "@/lib/data";
import { getUsuarioAtual } from "@/lib/auth";

export default async function RelatoriosPage() {
  const [usuario, vendas] = await Promise.all([getUsuarioAtual(), getVendas()]);

  return (
    <>
      <Topbar title="Relatórios" userName={usuario?.nome} userRole={usuario?.papel} />

      <main className="flex-1 overflow-y-auto p-6">
        <RelatorioVendas vendas={vendas} />
      </main>
    </>
  );
}
