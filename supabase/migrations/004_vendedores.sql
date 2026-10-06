-- Gestão de vendedores: status ativo/inativo e permissão de admin editar colegas.
-- Rode no Supabase: Dashboard > SQL Editor > New query > colar > Run.

alter table usuarios add column if not exists ativo boolean not null default true;

-- Função auxiliar (security definer, como empresa_do_usuario_atual) para evitar
-- recursão de RLS ao checar o papel de quem está fazendo a requisição.
create function public.papel_do_usuario_atual()
returns text
language sql
security definer set search_path = public
stable
as $$
  select papel from usuarios where id = auth.uid();
$$;

create policy "admin atualiza usuarios da própria empresa" on usuarios
  for update using (
    empresa_id = public.empresa_do_usuario_atual()
    and public.papel_do_usuario_atual() = 'admin'
  )
  with check (empresa_id = public.empresa_do_usuario_atual());
