import type { StatusParcela, StatusVeiculo, StatusVenda } from "@/types";

const veiculoStyles: Record<StatusVeiculo, string> = {
  disponivel: "bg-accent-2/10 text-accent-2",
  vendido: "bg-white/10 text-muted",
  reservado: "bg-purple/10 text-purple",
  manutencao: "bg-warning/10 text-warning",
};

export const veiculoLabels: Record<StatusVeiculo, string> = {
  disponivel: "Disponível",
  vendido: "Vendido",
  reservado: "Reservado",
  manutencao: "Em Manutenção",
};

const vendaStyles: Record<StatusVenda, string> = {
  concluida: "bg-accent-2/10 text-accent-2",
  pendente: "bg-warning/10 text-warning",
  cancelada: "bg-red-500/10 text-red-400",
};

const vendaLabels: Record<StatusVenda, string> = {
  concluida: "Concluída",
  pendente: "Pendente",
  cancelada: "Cancelada",
};

const parcelaStyles: Record<StatusParcela, string> = {
  paga: "bg-accent-2/10 text-accent-2",
  em_aberto: "bg-warning/10 text-warning",
  atrasada: "bg-red-500/10 text-red-400",
};

const parcelaLabels: Record<StatusParcela, string> = {
  paga: "Paga",
  em_aberto: "Em Aberto",
  atrasada: "Atrasada",
};

function Badge({ className, children }: { className: string; children: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function StatusVeiculoBadge({ status }: { status: StatusVeiculo }) {
  return <Badge className={veiculoStyles[status]}>{veiculoLabels[status]}</Badge>;
}

export function StatusVendaBadge({ status }: { status: StatusVenda }) {
  return <Badge className={vendaStyles[status]}>{vendaLabels[status]}</Badge>;
}

export function StatusParcelaBadge({ status }: { status: StatusParcela }) {
  return <Badge className={parcelaStyles[status]}>{parcelaLabels[status]}</Badge>;
}
