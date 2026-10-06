import { createClient } from "@/lib/supabase/server";

export async function getUsuarioAtual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("id, nome, papel, ativo")
    .eq("id", user.id)
    .single();

  return perfil;
}

export async function getEmpresaAtual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .single();
  if (!perfil) return null;

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, nome")
    .eq("id", perfil.empresa_id)
    .single();

  return empresa;
}
