import { Topbar } from "@/components/layout/Topbar";
import { NovoFornecedorModal } from "@/components/fornecedores/NovoFornecedorModal";
import { FornecedorRowActions } from "@/components/fornecedores/FornecedorRowActions";
import { tipoFornecedorLabels } from "@/components/fornecedores/FornecedorFormFields";
import { getFornecedores } from "@/lib/data";
import { getUsuarioAtual } from "@/lib/auth";

export default async function FornecedoresPage() {
  const [usuario, fornecedores] = await Promise.all([getUsuarioAtual(), getFornecedores()]);

  return (
    <>
      <Topbar title="Fornecedores" userName={usuario?.nome} userRole={usuario?.papel} />

      <main className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{fornecedores.length} fornecedores cadastrados</p>
          <NovoFornecedorModal />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          {fornecedores.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">
              Nenhum fornecedor cadastrado ainda.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">CPF/CNPJ</th>
                  <th className="px-5 py-3 font-medium">Telefone</th>
                  <th className="px-5 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {fornecedores.map((fornecedor) => (
                  <tr key={fornecedor.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3 font-medium">{fornecedor.nome}</td>
                    <td className="px-5 py-3 text-muted">{tipoFornecedorLabels[fornecedor.tipo]}</td>
                    <td className="px-5 py-3 text-muted">{fornecedor.documento}</td>
                    <td className="px-5 py-3 text-muted">{fornecedor.telefone}</td>
                    <td className="px-5 py-3">
                      <FornecedorRowActions fornecedor={fornecedor} />
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
