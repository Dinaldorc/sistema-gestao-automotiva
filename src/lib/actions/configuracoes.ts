"use server";

import { revalidatePath } from "next/cache";
import { empresaDoUsuarioAtual } from "@/lib/actions/empresa";

export interface ConfigFormState {
  error: string | null;
  success: boolean;
}

export async function atualizarMeuPerfil(
  _prevState: ConfigFormState,
  formData: FormData,
): Promise<ConfigFormState> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { error: "Nome é obrigatório.", success: false };

  const { error } = await contexto.supabase
    .from("usuarios")
    .update({ nome })
    .eq("id", contexto.usuarioId);

  if (error) {
    return { error: "Não foi possível atualizar seu perfil. Tente novamente.", success: false };
  }

  revalidatePath("/configuracoes");
  revalidatePath("/");
  return { error: null, success: true };
}

export async function atualizarEmpresa(
  _prevState: ConfigFormState,
  formData: FormData,
): Promise<ConfigFormState> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  if (contexto.papel !== "admin") {
    return {
      error: "Apenas administradores podem editar os dados da revendedora.",
      success: false,
    };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { error: "Nome é obrigatório.", success: false };

  const { error } = await contexto.supabase
    .from("empresas")
    .update({ nome })
    .eq("id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível atualizar a revendedora. Tente novamente.", success: false };
  }

  revalidatePath("/configuracoes");
  return { error: null, success: true };
}
