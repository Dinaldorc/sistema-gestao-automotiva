"use server";

import { revalidatePath } from "next/cache";
import { empresaDoUsuarioAtual } from "@/lib/actions/empresa";

export interface CustoFormState {
  error: string | null;
  success: boolean;
}

export async function adicionarCusto(
  _prevState: CustoFormState,
  formData: FormData,
): Promise<CustoFormState> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const veiculoId = String(formData.get("veiculo_id") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const valor = Number(formData.get("valor"));
  const data = String(formData.get("data") ?? "").trim();

  if (!veiculoId) return { error: "Veículo inválido.", success: false };
  if (!descricao) return { error: "Descrição é obrigatória.", success: false };
  if (!Number.isFinite(valor) || valor <= 0) return { error: "Valor inválido.", success: false };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data))) {
    return { error: "Data inválida.", success: false };
  }

  const { data: veiculo } = await contexto.supabase
    .from("veiculos")
    .select("id")
    .eq("id", veiculoId)
    .eq("empresa_id", contexto.empresaId)
    .maybeSingle();
  if (!veiculo) return { error: "Veículo não encontrado.", success: false };

  const { error } = await contexto.supabase.from("custos_veiculo").insert({
    empresa_id: contexto.empresaId,
    veiculo_id: veiculoId,
    descricao,
    valor,
    data,
  });

  if (error) {
    return { error: "Não foi possível salvar o custo. Tente novamente.", success: false };
  }

  revalidatePath("/veiculos");
  return { error: null, success: true };
}

export async function excluirCusto(id: string): Promise<{ error: string | null }> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error };

  const { error } = await contexto.supabase
    .from("custos_veiculo")
    .delete()
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível excluir o custo. Tente novamente." };
  }

  revalidatePath("/veiculos");
  return { error: null };
}
