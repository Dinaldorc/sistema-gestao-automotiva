"use server";

import { revalidatePath } from "next/cache";
import { empresaDoUsuarioAtual } from "@/lib/actions/empresa";
import type { StatusVeiculo, StatusVenda } from "@/types";

const STATUS_VALIDOS: StatusVenda[] = ["concluida", "cancelada", "pendente"];

const STATUS_VEICULO_POR_VENDA: Record<StatusVenda, StatusVeiculo> = {
  concluida: "vendido",
  pendente: "reservado",
  cancelada: "disponivel",
};

type Contexto = Extract<Awaited<ReturnType<typeof empresaDoUsuarioAtual>>, { ok: true }>;

export interface VendaFormState {
  error: string | null;
  success: boolean;
}

interface DadosVenda {
  veiculo_id: string;
  cliente_id: string;
  vendedor_id: string;
  data: string;
  valor: number;
  lucro: number;
  status: StatusVenda;
}

interface VendaExistente {
  id: string;
  veiculo_id: string;
  status: StatusVenda;
}

function parseVendaForm(formData: FormData): { data: DadosVenda } | { error: string } {
  const veiculoId = String(formData.get("veiculo_id") ?? "").trim();
  const clienteId = String(formData.get("cliente_id") ?? "").trim();
  const vendedorId = String(formData.get("vendedor_id") ?? "").trim();
  const data = String(formData.get("data") ?? "").trim();
  const valor = Number(formData.get("valor"));
  const lucroBruto = String(formData.get("lucro") ?? "").trim();
  const lucro = lucroBruto === "" ? 0 : Number(lucroBruto);
  const status = String(formData.get("status") ?? "concluida");

  if (!veiculoId) return { error: "Selecione o veículo." };
  if (!clienteId) return { error: "Selecione o cliente." };
  if (!vendedorId) return { error: "Selecione o vendedor." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data))) {
    return { error: "Data inválida." };
  }
  if (!Number.isFinite(valor) || valor <= 0) return { error: "Valor inválido." };
  if (!Number.isFinite(lucro)) return { error: "Lucro inválido." };
  if (!STATUS_VALIDOS.includes(status as StatusVenda)) return { error: "Status inválido." };

  return {
    data: {
      veiculo_id: veiculoId,
      cliente_id: clienteId,
      vendedor_id: vendedorId,
      data,
      valor,
      lucro,
      status: status as StatusVenda,
    },
  };
}

async function validarReferencias(
  contexto: Contexto,
  dados: DadosVenda,
  vendaAtual: VendaExistente | null,
): Promise<string | null> {
  const { supabase, empresaId } = contexto;

  const [cliente, vendedor, veiculo] = await Promise.all([
    supabase.from("clientes").select("id").eq("id", dados.cliente_id).eq("empresa_id", empresaId).maybeSingle(),
    supabase.from("usuarios").select("id").eq("id", dados.vendedor_id).eq("empresa_id", empresaId).maybeSingle(),
    supabase.from("veiculos").select("id, status").eq("id", dados.veiculo_id).eq("empresa_id", empresaId).maybeSingle(),
  ]);

  if (!cliente.data) return "Cliente não encontrado.";
  if (!vendedor.data) return "Vendedor não encontrado.";
  if (!veiculo.data) return "Veículo não encontrado.";

  // Venda cancelada não ocupa o veículo, então não precisa de disponibilidade.
  if (dados.status === "cancelada") return null;

  const jaVinculadoNestaVenda =
    vendaAtual !== null &&
    vendaAtual.veiculo_id === dados.veiculo_id &&
    vendaAtual.status !== "cancelada";
  const statusVeiculo = veiculo.data.status as StatusVeiculo;
  if (!jaVinculadoNestaVenda && statusVeiculo !== "disponivel" && statusVeiculo !== "reservado") {
    return "Este veículo não está disponível para venda.";
  }

  let conflito = supabase
    .from("vendas")
    .select("id")
    .eq("veiculo_id", dados.veiculo_id)
    .neq("status", "cancelada")
    .limit(1);
  if (vendaAtual) conflito = conflito.neq("id", vendaAtual.id);
  const { data: outraVenda } = await conflito;
  if (outraVenda && outraVenda.length > 0) return "Este veículo já está em outra venda.";

  return null;
}

async function sincronizarVeiculos(
  contexto: Contexto,
  antes: { veiculo_id: string; status: StatusVenda } | null,
  depois: { veiculo_id: string; status: StatusVenda } | null,
): Promise<boolean> {
  const { supabase, empresaId } = contexto;

  async function definirStatus(veiculoId: string, status: StatusVeiculo) {
    const { error } = await supabase
      .from("veiculos")
      .update({ status })
      .eq("id", veiculoId)
      .eq("empresa_id", empresaId);
    return !error;
  }

  if (
    antes &&
    antes.status !== "cancelada" &&
    (!depois || depois.veiculo_id !== antes.veiculo_id || depois.status === "cancelada")
  ) {
    if (!(await definirStatus(antes.veiculo_id, "disponivel"))) return false;
  }

  if (depois && depois.status !== "cancelada") {
    if (!(await definirStatus(depois.veiculo_id, STATUS_VEICULO_POR_VENDA[depois.status]))) {
      return false;
    }
  }

  return true;
}

function revalidarTudo() {
  revalidatePath("/vendas");
  revalidatePath("/veiculos");
  revalidatePath("/clientes");
  revalidatePath("/");
}

async function buscarVenda(contexto: Contexto, id: string): Promise<VendaExistente | null> {
  const { data } = await contexto.supabase
    .from("vendas")
    .select("id, veiculo_id, status")
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId)
    .maybeSingle();
  return data ? { id: data.id, veiculo_id: data.veiculo_id, status: data.status as StatusVenda } : null;
}

export async function criarVenda(
  _prevState: VendaFormState,
  formData: FormData,
): Promise<VendaFormState> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const parsed = parseVendaForm(formData);
  if ("error" in parsed) return { error: parsed.error, success: false };

  const erroReferencia = await validarReferencias(contexto, parsed.data, null);
  if (erroReferencia) return { error: erroReferencia, success: false };

  const { data: criada, error } = await contexto.supabase
    .from("vendas")
    .insert({ empresa_id: contexto.empresaId, ...parsed.data })
    .select("id")
    .single();

  if (error || !criada) {
    return { error: "Não foi possível salvar a venda. Tente novamente.", success: false };
  }

  const sincronizou = await sincronizarVeiculos(contexto, null, parsed.data);
  if (!sincronizou) {
    await contexto.supabase.from("vendas").delete().eq("id", criada.id);
    return {
      error: "Não foi possível atualizar o status do veículo. A venda não foi registrada.",
      success: false,
    };
  }

  revalidarTudo();
  return { error: null, success: true };
}

export async function atualizarVenda(
  _prevState: VendaFormState,
  formData: FormData,
): Promise<VendaFormState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Venda inválida.", success: false };

  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const atual = await buscarVenda(contexto, id);
  if (!atual) return { error: "Venda não encontrada.", success: false };

  const parsed = parseVendaForm(formData);
  if ("error" in parsed) return { error: parsed.error, success: false };

  const erroReferencia = await validarReferencias(contexto, parsed.data, atual);
  if (erroReferencia) return { error: erroReferencia, success: false };

  const { error } = await contexto.supabase
    .from("vendas")
    .update(parsed.data)
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível atualizar a venda. Tente novamente.", success: false };
  }

  const sincronizou = await sincronizarVeiculos(contexto, atual, parsed.data);
  revalidarTudo();
  if (!sincronizou) {
    return {
      error: "Venda atualizada, mas o status do veículo não pôde ser ajustado. Confira em Veículos.",
      success: false,
    };
  }

  return { error: null, success: true };
}

export async function excluirVenda(id: string): Promise<{ error: string | null }> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error };

  const atual = await buscarVenda(contexto, id);
  if (!atual) return { error: "Venda não encontrada." };

  const { error } = await contexto.supabase
    .from("vendas")
    .delete()
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível excluir a venda. Ela pode ter parcelas vinculadas." };
  }

  const sincronizou = await sincronizarVeiculos(contexto, atual, null);
  revalidarTudo();
  if (!sincronizou) {
    return { error: "Venda excluída, mas o status do veículo não pôde ser ajustado. Confira em Veículos." };
  }

  return { error: null };
}
