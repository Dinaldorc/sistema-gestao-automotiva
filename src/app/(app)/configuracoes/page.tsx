import { Topbar } from "@/components/layout/Topbar";
import { PerfilForm } from "@/components/configuracoes/PerfilForm";
import { EmpresaForm } from "@/components/configuracoes/EmpresaForm";
import { SenhaForm } from "@/components/configuracoes/SenhaForm";
import { getEmpresaAtual, getUsuarioAtual } from "@/lib/auth";

export default async function ConfiguracoesPage() {
  const [usuario, empresa] = await Promise.all([getUsuarioAtual(), getEmpresaAtual()]);
  const souAdmin = usuario?.papel === "admin";

  return (
    <>
      <Topbar title="Configurações" userName={usuario?.nome} userRole={usuario?.papel} />

      <main className="flex-1 max-w-xl space-y-6 overflow-y-auto p-6">
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-1 text-sm font-semibold">Meu Perfil</h2>
          <p className="mb-4 text-xs text-muted">Seu nome de exibição no sistema.</p>
          <PerfilForm nomeAtual={usuario?.nome ?? ""} />
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-1 text-sm font-semibold">Senha</h2>
          <p className="mb-4 text-xs text-muted">Troque sua senha de acesso.</p>
          <SenhaForm />
        </section>

        {souAdmin && (
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-1 text-sm font-semibold">Revendedora</h2>
            <p className="mb-4 text-xs text-muted">
              Nome da sua revendedora, usado para identificar sua empresa no sistema.
            </p>
            <EmpresaForm nomeAtual={empresa?.nome ?? ""} />
          </section>
        )}
      </main>
    </>
  );
}
