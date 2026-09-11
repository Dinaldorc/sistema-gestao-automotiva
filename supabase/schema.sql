-- Schema inicial do Sistema de Gestão Automotiva.
-- Rode este arquivo inteiro no Supabase: Dashboard > SQL Editor > New query > colar > Run.

create extension if not exists "pgcrypto";

-- empresa_id existe em quase toda tabela para permitir, no futuro, atender
-- mais de uma revendedora (multi-tenant) sem remodelar o banco.
create table empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

-- Perfil de cada usuário autenticado (1:1 com auth.users).
create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid not null references empresas(id),
  nome text not null,
  papel text not null default 'vendedor' check (papel in ('admin', 'vendedor')),
  created_at timestamptz not null default now()
);

create table veiculos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id),
  marca text not null,
  modelo text not null,
  ano int not null,
  valor numeric(12, 2) not null,
  status text not null default 'disponivel'
    check (status in ('disponivel', 'vendido', 'reservado', 'manutencao')),
  combustivel text,
  cambio text,
  created_at timestamptz not null default now()
);

create table clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id),
  nome text not null,
  telefone text,
  documento text,
  created_at timestamptz not null default now()
);

create table vendas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id),
  veiculo_id uuid not null references veiculos(id),
  cliente_id uuid not null references clientes(id),
  vendedor_id uuid not null references usuarios(id),
  data date not null default current_date,
  valor numeric(12, 2) not null,
  lucro numeric(12, 2) not null default 0,
  status text not null default 'concluida'
    check (status in ('concluida', 'cancelada', 'pendente')),
  created_at timestamptz not null default now()
);

create table parcelas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id),
  venda_id uuid not null references vendas(id),
  valor numeric(12, 2) not null,
  vencimento date not null,
  status text not null default 'em_aberto'
    check (status in ('paga', 'em_aberto', 'atrasada')),
  created_at timestamptz not null default now()
);

-- Empresa padrão (a sua revendedora, por enquanto a única deste banco).
insert into empresas (id, nome) values
  ('00000000-0000-0000-0000-000000000001', 'Minha Revendedora');

-- Quando alguém se cadastra (Supabase Auth), cria automaticamente o perfil
-- em "usuarios" já vinculado à empresa padrão acima.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuarios (id, empresa_id, nome, papel)
  values (
    new.id,
    '00000000-0000-0000-0000-000000000001',
    coalesce(new.raw_user_meta_data ->> 'nome', new.email),
    'vendedor'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security: cada usuário só enxerga dados da própria empresa.
alter table empresas enable row level security;
alter table usuarios enable row level security;
alter table veiculos enable row level security;
alter table clientes enable row level security;
alter table vendas enable row level security;
alter table parcelas enable row level security;

create function public.empresa_do_usuario_atual()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select empresa_id from usuarios where id = auth.uid();
$$;

create policy "ver própria empresa" on empresas
  for select using (id = public.empresa_do_usuario_atual());

create policy "ver colegas da mesma empresa" on usuarios
  for select using (empresa_id = public.empresa_do_usuario_atual());

create policy "veiculos da própria empresa" on veiculos
  for all using (empresa_id = public.empresa_do_usuario_atual())
  with check (empresa_id = public.empresa_do_usuario_atual());

create policy "clientes da própria empresa" on clientes
  for all using (empresa_id = public.empresa_do_usuario_atual())
  with check (empresa_id = public.empresa_do_usuario_atual());

create policy "vendas da própria empresa" on vendas
  for all using (empresa_id = public.empresa_do_usuario_atual())
  with check (empresa_id = public.empresa_do_usuario_atual());

create policy "parcelas da própria empresa" on parcelas
  for all using (empresa_id = public.empresa_do_usuario_atual())
  with check (empresa_id = public.empresa_do_usuario_atual());
