-- Custos extras por veículo (mecânica, funilaria, documentação, transferência etc.).
-- Somados ao custo de aquisição, formam o custo total usado no CMV.
-- Rode no Supabase: Dashboard > SQL Editor > New query > colar > Run.

create table custos_veiculo (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id),
  veiculo_id uuid not null references veiculos(id) on delete cascade,
  descricao text not null,
  valor numeric(12, 2) not null check (valor >= 0),
  data date not null default current_date,
  created_at timestamptz not null default now()
);

alter table custos_veiculo enable row level security;

create policy "custos de veículo da própria empresa" on custos_veiculo
  for all using (empresa_id = public.empresa_do_usuario_atual())
  with check (empresa_id = public.empresa_do_usuario_atual());
