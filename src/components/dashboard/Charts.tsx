"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";

const tooltipStyle = {
  background: "#111a2e",
  border: "1px solid #1f2a44",
  borderRadius: 8,
  fontSize: 12,
  color: "#e5edf7",
};

export function VeiculosStatusDonut({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold">{total}</span>
          <span className="text-xs text-muted">Total</span>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        {data.map((entry) => (
          <li key={entry.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-muted">{entry.label}</span>
            <span className="font-medium">
              {entry.value} ({Math.round((entry.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FaturamentoLineChart({
  data,
}: {
  data: { data: string; valor: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
        <XAxis dataKey="data" stroke="#8b9bb4" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#8b9bb4"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => formatCurrency(Number(value))}
        />
        <Line
          type="monotone"
          dataKey="valor"
          stroke="#22d3ee"
          strokeWidth={2}
          dot={{ r: 3, fill: "#22d3ee" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function VendasPorVendedorBarChart({
  data,
}: {
  data: { nome: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" horizontal={false} />
        <XAxis
          type="number"
          stroke="#8b9bb4"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="nome"
          stroke="#8b9bb4"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => formatCurrency(Number(value))}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="total" fill="#22d3ee" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
