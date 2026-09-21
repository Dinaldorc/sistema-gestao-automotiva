-- Controle de estoque: de quem veio cada veículo, como e por quanto.
-- Base do CMV (custo da mercadoria vendida).
-- Rode no Supabase: Dashboard > SQL Editor > New query > colar > Run.

alter table veiculos
  add column if not exists fornecedor_id uuid references fornecedores(id),
  add column if not exists origem text not null default 'compra'
    check (origem in ('compra', 'troca', 'entrada')),
  add column if not exists custo_aquisicao numeric(12, 2) not null default 0,
  add column if not exists data_aquisicao date;
