import type { CustoVeiculo } from "@/types";

export function somaCustosExtras(custos: CustoVeiculo[]): number {
  return custos.reduce((soma, custo) => soma + custo.valor, 0);
}

export function custoTotalVeiculo(custoAquisicao: number, custos: CustoVeiculo[]): number {
  return custoAquisicao + somaCustosExtras(custos);
}
