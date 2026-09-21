"use server";

import { revalidatePath } from "next/cache";
import { empresaDoUsuarioAtual } from "@/lib/actions/empresa";
import type { OrigemVeiculo, StatusVeiculo } from "@/types";

const STATUS_VALIDOS: StatusVeiculo[] = ["disponivel", "vendido", "reservado", "manutencao"];
const ORIGENS_VALIDAS: OrigemVeiculo[] = ["compra", "troca", "entrada"];

type Contexto = Extract<Awaited<ReturnType<typeof empresaDoUsuarioAtual>>, { ok: true }>;

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
  fornecedor_id: string;
  origem: OrigemVeiculo;
  custo_aquisicao: number;
  data_aquisicao: string;
}

function parseVeiculoForm(formData: FormData): { data: DadosVeiculo } | { error: string } {
  const marca = String(formData.get("marca") ?? "").trim();
  const modelo = String(formData.get("modelo") ?? "").trim();
  const ano = Number(formData.get("ano"));
  const valor = Number(formData.get("valor"));
  const combustivel = String(formData.get("combustivel") ?? "").trim();
  const cambio = String(formData.get("cambio") ?? "").trim();
  const status = String(formData.get("status") ?? "disponivel");
  const fornecedorId = String(formData.get("fornecedor_id") ?? "").trim();
  const origem = String(formData.get("origem") ?? "compra");
  const custoBruto = String(formData.get("custo_aquisicao") ?? "").trim();
  const custo = custoBruto === "" ? Number.NaN : Number(custoBruto);
  const dataAquisicao = String(formData.get("data_aquisicao") ?? "").trim();

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
  if (!fornecedorId) {
    return { error: "Selecione o fornecedor." };
  }
  if (!ORIGENS_VALIDAS.includes(origem as OrigemVeiculo)) {
    return { error: "Origem inválida." };
  }
  if (!Number.isFinite(custo) || custo < 0) {
    return { error: "Informe o custo de aquisição." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataAquisicao) || Number.isNaN(Date.parse(dataAquisicao))) {
    return { error: "Data de aquisição inválida." };
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
      fornecedor_id: fornecedorId,
      origem: origem as OrigemVeiculo,
      custo_aquisicao: custo,
      data_aquisicao: dataAquisicao,
    },
  };
}

async function fornecedorPertenceAEmpresa(contexto: Contexto, fornecedorId: string) {
  const { data } = await contexto.supabase
    .from("fornecedores")
    .select("id")
    .eq("id", fornecedorId)
    .eq("empresa_id", contexto.empresaId)
    .maybeSingle();
  return data !== null;
}

export async function criarVeiculo(
  _prevState: VeiculoFormState,
  formData: FormData,
): Promise<VeiculoFormState> {
  const contexto = await empresaDoUsuarioAtual();
  if (!contexto.ok) return { error: contexto.error, success: false };

  const parsed = parseVeiculoForm(formData);
  if ("error" in parsed) return { error: parsed.error, success: false };

  if (!(await fornecedorPertenceAEmpresa(contexto, parsed.data.fornecedor_id))) {
    return { error: "Fornecedor não encontrado.", success: false };
  }

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

  if (!(await fornecedorPertenceAEmpresa(contexto, parsed.data.fornecedor_id))) {
    return { error: "Fornecedor não encontrado.", success: false };
  }

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
