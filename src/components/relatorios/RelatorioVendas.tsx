"use client";

import { useMemo, useState } from "react";
import { DollarSign, Download, Receipt, ShoppingCart, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { StatusVendaBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { VendaDetalhada } from "@/lib/data";

function hojeISO() {
  return new Date().toLocaleDateString("sv-SE");
}

function primeiroDiaDoMesISO() {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), 1).toLocaleDateString("sv-SE");
}

function baixarCsv(nomeArquivo: string, linhas: string[][]) {
  const conteudo = linhas
    .map((linha) =>
      linha
        .map((campo) => {
          const texto = String(campo ?? "");
          return /[",\n;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
        })
        .join(";"),
    )
    .join("\n");

  const blob = new Blob([`﻿${conteudo}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}

export function RelatorioVendas({ vendas }: { vendas: VendaDetalhada[] }) {
  const [de, setDe] = useState(primeiroDiaDoMesISO());
  const [ate, setAte] = useState(hojeISO());

  const vendasNoPeriodo = useMemo(
    () => vendas.filter((v) => v.data >= de && v.data <= ate),
    [vendas, de, ate],
  );
  const vendasValidas = useMemo(
    () => vendasNoPeriodo.filter((v) => v.status !== "cancelada"),
    [vendasNoPeriodo],
  );

  const receitaBruta = vendasValidas.reduce((sum, v) => sum + v.valor, 0);
  const lucroBruto = vendasValidas.reduce((sum, v) => sum + v.lucro, 0);
  const cmv = receitaBruta - lucroBruto;

  const porVendedor = useMemo(() => {
    const mapa = new Map<string, { nome: string; qtd: number; receita: number; lucro: number }>();
    for (const venda of vendasValidas) {
      const nome = venda.vendedor?.nome ?? "Sem vendedor";
      const atual = mapa.get(nome) ?? { nome, qtd: 0, receita: 0, lucro: 0 };
      atual.qtd += 1;
      atual.receita += venda.valor;
      atual.lucro += venda.lucro;
      mapa.set(nome, atual);
    }
    return Array.from(mapa.values()).sort((a, b) => b.receita - a.receita);
  }, [vendasValidas]);

  function exportarCsv() {
    const linhas = [
      ["Data", "Veículo", "Cliente", "Vendedor", "Valor", "CMV", "Lucro", "Status"],
      ...vendasNoPeriodo.map((v) => [
        formatDate(v.data),
        `${v.veiculo?.marca ?? ""} ${v.veiculo?.modelo ?? ""}`.trim(),
        v.cliente?.nome ?? "",
        v.vendedor?.nome ?? "",
        v.valor.toFixed(2),
        (v.valor - v.lucro).toFixed(2),
        v.lucro.toFixed(2),
        v.status,
      ]),
    ];
    baixarCsv(`vendas_${de}_a_${ate}.csv`, linhas);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
        <label className="text-sm">
          <span className="mb-1.5 block text-muted">De</span>
          <input
            type="date"
            value={de}
            onChange={(e) => setDe(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted">Até</span>
          <input
            type="date"
            value={ate}
            onChange={(e) => setAte(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>

        <button
          onClick={exportarCsv}
          disabled={vendasNoPeriodo.length === 0}
          className="ml-auto flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-white/5 disabled:opacity-50"
        >
          <Download size={16} />
          Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ShoppingCart} label="Vendas no Período" value={String(vendasValidas.length)} />
        <StatCard icon={DollarSign} label="Receita Bruta (R$)" value={formatCurrency(receitaBruta)} />
        <StatCard icon={Receipt} label="CMV (R$)" value={formatCurrency(cmv)} />
        <StatCard icon={TrendingUp} label="Lucro Bruto (R$)" value={formatCurrency(lucroBruto)} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold">Vendas por Vendedor</h3>
        {porVendedor.length === 0 ? (
          <p className="text-sm text-muted">Sem vendas no período selecionado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-muted">
                  <th className="pb-2 pr-3 font-medium">Vendedor</th>
                  <th className="pb-2 pr-3 font-medium">Vendas</th>
                  <th className="pb-2 pr-3 font-medium">Receita</th>
                  <th className="pb-2 font-medium">Lucro</th>
                </tr>
              </thead>
              <tbody>
                {porVendedor.map((linha) => (
                  <tr key={linha.nome} className="border-t border-border/60">
                    <td className="py-2 pr-3 font-medium">{linha.nome}</td>
                    <td className="py-2 pr-3 text-muted">{linha.qtd}</td>
                    <td className="py-2 pr-3">{formatCurrency(linha.receita)}</td>
                    <td className="py-2 text-accent-2">{formatCurrency(linha.lucro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        {vendasNoPeriodo.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">
            Nenhuma venda no período selecionado.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Veículo</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Vendedor</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Lucro</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {vendasNoPeriodo.map((venda) => (
                <tr key={venda.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 text-muted">{formatDate(venda.data)}</td>
                  <td className="px-4 py-3 font-medium">
                    {venda.veiculo?.marca} {venda.veiculo?.modelo}
                  </td>
                  <td className="px-4 py-3">{venda.cliente?.nome}</td>
                  <td className="px-4 py-3">{venda.vendedor?.nome}</td>
                  <td className="px-4 py-3">{formatCurrency(venda.valor)}</td>
                  <td className="px-4 py-3 text-accent-2">{formatCurrency(venda.lucro)}</td>
                  <td className="px-4 py-3">
                    <StatusVendaBadge status={venda.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
