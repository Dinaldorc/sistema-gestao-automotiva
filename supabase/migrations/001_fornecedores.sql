-- Fornecedores: de quem a revendedora compra ou recebe veículos.
-- Rode no Supabase: Dashboard > SQL Editor > New query > colar > Run.

create table fornecedores (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id),
  nome text not null,
  tipo text not null default 'pessoa_fisica'
    check (tipo in ('pessoa_fisica', 'revendedora')),
  documento text,
  telefone text,
  created_at timestamptz not null default now()
);

alter table fornecedores enable row level security;

create policy "fornecedores da própria empresa" on fornecedores
  for all using (empresa_id = public.empresa_do_usuario_atual())
  with check (empresa_id = public.empresa_do_usuario_atual());
