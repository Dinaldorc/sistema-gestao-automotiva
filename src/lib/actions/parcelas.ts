"use server";

import { revalidatePath } from "next/cache";
import { empresaDoUsuarioAtual } from "@/lib/actions/empresa";
import type { StatusParcela } from "@/types";

const STATUS_VALIDOS: StatusParcela[] = ["paga", "em_aberto", "atrasada"];
const TOLERANCIA = 0.01;

type Contexto = Extract<Awaited<ReturnType<typeof empresaDoUsuarioAtual>>, { ok: true }>;

export interface ParcelaFormState {
  error: string | null;
  success: boolean;
}

interface DadosParcela {
  venda_id: string;
  valor: number;
  vencimento: string;
  status: StatusParcela;
}

function parseParcelaForm(formData: FormData): { data: DadosParcela } | { error: string } {
  const vendaId = String(formData.get("venda_id") ?? "").trim();
  const valor = Number(formData.get("valor"));
  const vencimento = String(formData.get("vencimento") ?? "").trim();
  const status = String(formData.get("status") ?? "em_aberto");

  if (!vendaId) return { error: "Selecione a venda." };
  if (!Number.isFinite(valor) || valor <= 0) return { error: "Valor inválido." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(vencimento) || Number.isNaN(Date.parse(vencimento))) {
    return { error: "Vencimento inválido." };
  }
  if (!STATUS_VALIDOS.includes(status as StatusParcela)) return { error: "Status inválido." };

  return { data: { venda_id: vendaId, valor, vencimento, status: status as StatusParcela } };
}

async function saldoDisponivel(
  contexto: Contexto,
  vendaId: string,
  parcelaIgnorada: string | null,
): Promise<string | { valorVenda: number; jaParcelado: number }> {
  const { data: venda } = await contexto.supabase
    .from("vendas")
    .select("valor")
    .eq("id", vendaId)
    .eq("empresa_id", contexto.empresaId)
    .maybeSingle();
  if (!venda) return "Venda não encontrada.";

  let query = contexto.supabase
    .from("parcelas")
    .select("valor")
    .eq("venda_id", vendaId)
    .eq("empresa_id", contexto.empresaId);
  if (parcelaIgnorada) query = query.neq("id", parcelaIgnorada);
  const { data: outras } = await query;

  const jaParcelado = (outras ?? []).reduce((soma, p) => soma + Number(p.valor), 0);
  return { valorVenda: Number(venda.valor), jaParcelado };
}

export async function criarParcela(
  _prevState: ParcelaFormState,
  formData: FormData,
): Promise<ParcelaFormState> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const parsed = parseParcelaForm(formData);
  if ("error" in parsed) return { error: parsed.error, success: false };

  const saldo = await saldoDisponivel(contexto, parsed.data.venda_id, null);
  if (typeof saldo === "string") return { error: saldo, success: false };
  if (saldo.jaParcelado + parsed.data.valor > saldo.valorVenda + TOLERANCIA) {
    const restante = Math.max(0, saldo.valorVenda - saldo.jaParcelado);
    return {
      error: `Esse valor passa do saldo da venda. Restam R$ ${restante.toFixed(2)} para parcelar.`,
      success: false,
    };
  }

  const { error } = await contexto.supabase.from("parcelas").insert({
    empresa_id: contexto.empresaId,
    ...parsed.data,
  });

  if (error) {
    return { error: "Não foi possível salvar a parcela. Tente novamente.", success: false };
  }

  revalidatePath("/financeiro");
  revalidatePath("/");
  return { error: null, success: true };
}

export async function atualizarParcela(
  _prevState: ParcelaFormState,
  formData: FormData,
): Promise<ParcelaFormState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Parcela inválida.", success: false };

  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const parsed = parseParcelaForm(formData);
  if ("error" in parsed) return { error: parsed.error, success: false };

  const saldo = await saldoDisponivel(contexto, parsed.data.venda_id, id);
  if (typeof saldo === "string") return { error: saldo, success: false };
  if (saldo.jaParcelado + parsed.data.valor > saldo.valorVenda + TOLERANCIA) {
    const restante = Math.max(0, saldo.valorVenda - saldo.jaParcelado);
    return {
      error: `Esse valor passa do saldo da venda. Restam R$ ${restante.toFixed(2)} para parcelar.`,
      success: false,
    };
  }

  const { error } = await contexto.supabase
    .from("parcelas")
    .update(parsed.data)
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível atualizar a parcela. Tente novamente.", success: false };
  }

  revalidatePath("/financeiro");
  revalidatePath("/");
  return { error: null, success: true };
}

export async function marcarParcelaComoPaga(id: string): Promise<{ error: string | null }> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error };

  const { error } = await contexto.supabase
    .from("parcelas")
    .update({ status: "paga" })
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível marcar a parcela como paga." };
  }

  revalidatePath("/financeiro");
  revalidatePath("/");
  return { error: null };
}

export async function excluirParcela(id: string): Promise<{ error: string | null }> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error };

  const { error } = await contexto.supabase
    .from("parcelas")
    .delete()
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível excluir a parcela. Tente novamente." };
  }

  revalidatePath("/financeiro");
  revalidatePath("/");
  return { error: null };
}
