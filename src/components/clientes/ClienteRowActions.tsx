import { EditarClienteModal } from "@/components/clientes/EditarClienteModal";
import { ExcluirClienteButton } from "@/components/clientes/ExcluirClienteButton";
import type { Cliente } from "@/types";

export function ClienteRowActions({ cliente }: { cliente: Cliente }) {
  return (
    <div className="flex items-center gap-3">
      <EditarClienteModal cliente={cliente} />
      <ExcluirClienteButton id={cliente.id} descricao={cliente.nome} />
    </div>
  );
}
