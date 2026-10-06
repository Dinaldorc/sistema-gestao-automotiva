import { createClient } from "@/lib/supabase/server";
import type { PapelUsuario } from "@/types";

export async function empresaDoUsuarioAtual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado." };

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("empresa_id, papel")
    .eq("id", user.id)
    .single();
  if (!perfil) return { ok: false as const, error: "Usuário sem empresa vinculada." };

  return {
    ok: true as const,
    supabase,
    empresaId: perfil.empresa_id as string,
    usuarioId: user.id,
    papel: perfil.papel as PapelUsuario,
  };
}
