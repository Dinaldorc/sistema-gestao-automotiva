-- Configurações: cada pessoa edita o próprio nome e senha; admin edita o
-- nome da revendedora.
-- Rode no Supabase: Dashboard > SQL Editor > New query > colar > Run.

-- RLS não restringe coluna por coluna — então mesmo com a policy de auto-edição
-- abaixo, nada impede (a nível de RLS) que alguém tente alterar o próprio papel
-- ou ativo num UPDATE direto na API. Este trigger reverte qualquer tentativa
-- assim vinda de quem não for admin, não importa por qual caminho a requisição
-- chegou (UI, chamada direta à API etc.).
create function public.proteger_papel_ativo()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if public.papel_do_usuario_atual() <> 'admin' then
    new.papel := old.papel;
    new.ativo := old.ativo;
  end if;
  return new;
end;
$$;

create trigger proteger_papel_ativo_trigger
  before update on usuarios
  for each row execute function public.proteger_papel_ativo();

create policy "usuário atualiza o próprio perfil" on usuarios
  for update using (id = auth.uid())
  with check (id = auth.uid() and empresa_id = public.empresa_do_usuario_atual());

create policy "admin atualiza a própria empresa" on empresas
  for update using (
    id = public.empresa_do_usuario_atual()
    and public.papel_do_usuario_atual() = 'admin'
  )
  with check (id = public.empresa_do_usuario_atual());
