"use server";

import { revalidatePath } from "next/cache";
import { empresaDoUsuarioAtual } from "@/lib/actions/empresa";
import type { PapelUsuario } from "@/types";

const PAPEIS_VALIDOS: PapelUsuario[] = ["admin", "vendedor"];

export interface VendedorFormState {
  error: string | null;
  success: boolean;
}

export async function atualizarVendedor(
  _prevState: VendedorFormState,
  formData: FormData,
): Promise<VendedorFormState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Vendedor inválido.", success: false };

  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  if (contexto.papel !== "admin") {
    return { error: "Apenas administradores podem editar vendedores.", success: false };
  }
  if (id === contexto.usuarioId) {
    return { error: "Você não pode editar sua própria conta por aqui.", success: false };
  }

  const papel = String(formData.get("papel") ?? "");
  const ativo = formData.get("ativo") === "true";

  if (!PAPEIS_VALIDOS.includes(papel as PapelUsuario)) {
    return { error: "Papel inválido.", success: false };
  }

  const { error } = await contexto.supabase
    .from("usuarios")
    .update({ papel, ativo })
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível atualizar o vendedor. Tente novamente.", success: false };
  }

  revalidatePath("/vendedores");
  return { error: null, success: true };
}
