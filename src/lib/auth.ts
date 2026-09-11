import { createClient } from "@/lib/supabase/server";

export async function getUsuarioAtual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("nome, papel")
    .eq("id", user.id)
    .single();

  return perfil;
}
