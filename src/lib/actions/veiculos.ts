"use server";

import { revalidatePath } from "next/cache";
import { empresaDoUsuarioAtual } from "@/lib/actions/empresa";
import type { StatusVeiculo } from "@/types";

const STATUS_VALIDOS: StatusVeiculo[] = ["disponivel", "vendido", "reservado", "manutencao"];

export interface VeiculoFormState {
  error: string | null;
  success: boolean;
}

interface DadosVeiculo {
  marca: string;
  modelo: string;
  ano: number;
  valor: number;
  combustivel: string | null;
  cambio: string | null;
  status: StatusVeiculo;
}

function parseVeiculoForm(formData: FormData): { data: DadosVeiculo } | { error: string } {
  const marca = String(formData.get("marca") ?? "").trim();
  const modelo = String(formData.get("modelo") ?? "").trim();
  const ano = Number(formData.get("ano"));
  const valor = Number(formData.get("valor"));
  const combustivel = String(formData.get("combustivel") ?? "").trim();
  const cambio = String(formData.get("cambio") ?? "").trim();
  const status = String(formData.get("status") ?? "disponivel");

  if (!marca || !modelo) {
    return { error: "Marca e modelo são obrigatórios." };
  }
  const anoAtual = new Date().getFullYear();
  if (!Number.isInteger(ano) || ano < 1900 || ano > anoAtual + 1) {
    return { error: "Ano inválido." };
  }
  if (!Number.isFinite(valor) || valor <= 0) {
    return { error: "Valor inválido." };
  }
  if (!STATUS_VALIDOS.includes(status as StatusVeiculo)) {
    return { error: "Status inválido." };
  }

  return {
    data: {
      marca,
      modelo,
      ano,
      valor,
      combustivel: combustivel || null,
      cambio: cambio || null,
      status: status as StatusVeiculo,
    },
  };
}

export async function criarVeiculo(
  _prevState: VeiculoFormState,
  formData: FormData,
): Promise<VeiculoFormState> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const parsed = parseVeiculoForm(formData);
  if ("error" in parsed) return { error: parsed.error, success: false };

  const { error } = await contexto.supabase.from("veiculos").insert({
    empresa_id: contexto.empresaId,
    ...parsed.data,
  });

  if (error) {
    return { error: "Não foi possível salvar o veículo. Tente novamente.", success: false };
  }

  revalidatePath("/veiculos");
  revalidatePath("/");
  return { error: null, success: true };
}

export async function atualizarVeiculo(
  _prevState: VeiculoFormState,
  formData: FormData,
): Promise<VeiculoFormState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Veículo inválido.", success: false };

  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const parsed = parseVeiculoForm(formData);
  if ("error" in parsed) return { error: parsed.error, success: false };

  const { error } = await contexto.supabase
    .from("veiculos")
    .update(parsed.data)
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível atualizar o veículo. Tente novamente.", success: false };
  }

  revalidatePath("/veiculos");
  revalidatePath("/");
  return { error: null, success: true };
}

export async function excluirVeiculo(id: string): Promise<{ error: string | null }> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error };

  const { error } = await contexto.supabase
    .from("veiculos")
    .delete()
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível excluir o veículo. Ele pode já estar vinculado a uma venda." };
  }

  revalidatePath("/veiculos");
  revalidatePath("/");
  return { error: null };
}
