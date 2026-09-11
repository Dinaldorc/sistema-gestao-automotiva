"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { StatusVeiculo } from "@/types";

const STATUS_VALIDOS: StatusVeiculo[] = ["disponivel", "vendido", "reservado", "manutencao"];

export interface CriarVeiculoState {
  error: string | null;
  success: boolean;
}

export async function criarVeiculo(
  _prevState: CriarVeiculoState,
  formData: FormData,
): Promise<CriarVeiculoState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Não autenticado.", success: false };
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .single();
  if (!perfil) {
    return { error: "Usuário sem empresa vinculada.", success: false };
  }

  const marca = String(formData.get("marca") ?? "").trim();
  const modelo = String(formData.get("modelo") ?? "").trim();
  const ano = Number(formData.get("ano"));
  const valor = Number(formData.get("valor"));
  const combustivel = String(formData.get("combustivel") ?? "").trim();
  const cambio = String(formData.get("cambio") ?? "").trim();
  const status = String(formData.get("status") ?? "disponivel");

  if (!marca || !modelo) {
    return { error: "Marca e modelo são obrigatórios.", success: false };
  }
  const anoAtual = new Date().getFullYear();
  if (!Number.isInteger(ano) || ano < 1900 || ano > anoAtual + 1) {
    return { error: "Ano inválido.", success: false };
  }
  if (!Number.isFinite(valor) || valor <= 0) {
    return { error: "Valor inválido.", success: false };
  }
  if (!STATUS_VALIDOS.includes(status as StatusVeiculo)) {
    return { error: "Status inválido.", success: false };
  }

  const { error } = await supabase.from("veiculos").insert({
    empresa_id: perfil.empresa_id,
    marca,
    modelo,
    ano,
    valor,
    combustivel: combustivel || null,
    cambio: cambio || null,
    status,
  });

  if (error) {
    return { error: "Não foi possível salvar o veículo. Tente novamente.", success: false };
  }

  revalidatePath("/veiculos");
  revalidatePath("/");
  return { error: null, success: true };
}
