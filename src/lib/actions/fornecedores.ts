"use server";

import { revalidatePath } from "next/cache";
import { empresaDoUsuarioAtual } from "@/lib/actions/empresa";
import type { TipoFornecedor } from "@/types";

const TIPOS_VALIDOS: TipoFornecedor[] = ["pessoa_fisica", "revendedora"];

export interface FornecedorFormState {
  error: string | null;
  success: boolean;
}

interface DadosFornecedor {
  nome: string;
  tipo: TipoFornecedor;
  documento: string | null;
  telefone: string | null;
}

function parseFornecedorForm(
  formData: FormData,
): { data: DadosFornecedor } | { error: string } {
  const nome = String(formData.get("nome") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "pessoa_fisica");
  const documento = String(formData.get("documento") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();

  if (!nome) return { error: "Nome é obrigatório." };
  if (!TIPOS_VALIDOS.includes(tipo as TipoFornecedor)) return { error: "Tipo inválido." };

  return {
    data: {
      nome,
      tipo: tipo as TipoFornecedor,
      documento: documento || null,
      telefone: telefone || null,
    },
  };
}

export async function criarFornecedor(
  _prevState: FornecedorFormState,
  formData: FormData,
): Promise<FornecedorFormState> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const parsed = parseFornecedorForm(formData);
  if ("error" in parsed) return { error: parsed.error, success: false };

  const { error } = await contexto.supabase.from("fornecedores").insert({
    empresa_id: contexto.empresaId,
    ...parsed.data,
  });

  if (error) {
    return { error: "Não foi possível salvar o fornecedor. Tente novamente.", success: false };
  }

  revalidatePath("/fornecedores");
  return { error: null, success: true };
}

export async function atualizarFornecedor(
  _prevState: FornecedorFormState,
  formData: FormData,
): Promise<FornecedorFormState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Fornecedor inválido.", success: false };

  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const parsed = parseFornecedorForm(formData);
  if ("error" in parsed) return { error: parsed.error, success: false };

  const { error } = await contexto.supabase
    .from("fornecedores")
    .update(parsed.data)
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível atualizar o fornecedor. Tente novamente.", success: false };
  }

  revalidatePath("/fornecedores");
  return { error: null, success: true };
}

export async function excluirFornecedor(id: string): Promise<{ error: string | null }> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error };

  const { error } = await contexto.supabase
    .from("fornecedores")
    .delete()
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível excluir o fornecedor. Ele pode estar vinculado a veículos." };
  }

  revalidatePath("/fornecedores");
  return { error: null };
}
