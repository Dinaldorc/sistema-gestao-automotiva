import { createClient } from "@/lib/supabase/server";
import type {
  Cliente,
  Parcela,
  StatusParcela,
  StatusVeiculo,
  StatusVenda,
  Veiculo,
} from "@/types";

export async function getVeiculos(): Promise<Veiculo[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veiculos")
    .select("id, empresa_id, marca, modelo, ano, valor, status, combustivel, cambio")
    .order("created_at", { ascending: false });

  return (data ?? []).map((v) => ({
    id: v.id,
    empresaId: v.empresa_id,
    marca: v.marca,
    modelo: v.modelo,
    ano: v.ano,
    valor: Number(v.valor),
    status: v.status as StatusVeiculo,
    combustivel: v.combustivel ?? "",
    cambio: v.cambio ?? "",
  }));
}

export async function getClientes(): Promise<Cliente[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("id, empresa_id, nome, telefone, documento")
    .order("created_at", { ascending: false });

  return (data ?? []).map((c) => ({
    id: c.id,
    empresaId: c.empresa_id,
    nome: c.nome,
    telefone: c.telefone ?? "",
    documento: c.documento ?? "",
  }));
}

export interface VendaDetalhada {
  id: string;
  data: string;
  valor: number;
  lucro: number;
  status: StatusVenda;
  veiculo: { marca: string; modelo: string } | null;
  cliente: { id: string; nome: string } | null;
  vendedor: { nome: string } | null;
}

export async function getVendas(): Promise<VendaDetalhada[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendas")
    .select(
      "id, data, valor, lucro, status, veiculo:veiculos(marca, modelo), cliente:clientes(id, nome), vendedor:usuarios(nome)",
    )
    .order("data", { ascending: false });

  return (data ?? []).map((v) => ({
    id: v.id,
    data: v.data,
    valor: Number(v.valor),
    lucro: Number(v.lucro),
    status: v.status as StatusVenda,
    veiculo: Array.isArray(v.veiculo) ? (v.veiculo[0] ?? null) : v.veiculo,
    cliente: Array.isArray(v.cliente) ? (v.cliente[0] ?? null) : v.cliente,
    vendedor: Array.isArray(v.vendedor) ? (v.vendedor[0] ?? null) : v.vendedor,
  }));
}

export async function getParcelas(): Promise<Parcela[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("parcelas")
    .select("id, empresa_id, venda_id, valor, vencimento, status")
    .order("vencimento", { ascending: true });

  return (data ?? []).map((p) => ({
    id: p.id,
    empresaId: p.empresa_id,
    vendaId: p.venda_id,
    valor: Number(p.valor),
    vencimento: p.vencimento,
    status: p.status as StatusParcela,
  }));
}
