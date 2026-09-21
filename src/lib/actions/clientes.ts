"use server";

import { revalidatePath } from "next/cache";
import { empresaDoUsuarioAtual } from "@/lib/actions/empresa";

export interface ClienteFormState {
  error: string | null;
  success: boolean;
}

interface DadosCliente {
  nome: string;
  telefone: string | null;
  documento: string | null;
}

function parseClienteForm(formData: FormData): { data: DadosCliente } | { error: string } {
  const nome = String(formData.get("nome") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const documento = String(formData.get("documento") ?? "").trim();

  if (!nome) {
    return { error: "Nome é obrigatório." };
  }

  return {
    data: {
      nome,
      telefone: telefone || null,
      documento: documento || null,
    },
  };
}

export async function criarCliente(
  _prevState: ClienteFormState,
  formData: FormData,
): Promise<ClienteFormState> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const parsed = parseClienteForm(formData);
  if ("error" in parsed) return { error: parsed.error, success: false };

  const { error } = await contexto.supabase.from("clientes").insert({
    empresa_id: contexto.empresaId,
    ...parsed.data,
  });

  if (error) {
    return { error: "Não foi possível salvar o cliente. Tente novamente.", success: false };
  }

  revalidatePath("/clientes");
  return { error: null, success: true };
}

export async function atualizarCliente(
  _prevState: ClienteFormState,
  formData: FormData,
): Promise<ClienteFormState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Cliente inválido.", success: false };

  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const parsed = parseClienteForm(formData);
  if ("error" in parsed) return { error: parsed.error, success: false };

  const { error } = await contexto.supabase
    .from("clientes")
    .update(parsed.data)
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível atualizar o cliente. Tente novamente.", success: false };
  }

  revalidatePath("/clientes");
  revalidatePath("/vendas");
  revalidatePath("/");
  return { error: null, success: true };
}

export async function excluirCliente(id: string): Promise<{ error: string | null }> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error };

  const { error } = await contexto.supabase
    .from("clientes")
    .delete()
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);

  if (error) {
    return { error: "Não foi possível excluir o cliente. Ele pode já estar vinculado a uma venda." };
  }

  revalidatePath("/clientes");
  return { error: null };
}
