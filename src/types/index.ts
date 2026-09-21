// empresaId existe desde já para permitir, no futuro, que o sistema
// atenda mais de uma revendedora (multi-tenant) sem precisar remodelar o banco.

export type StatusVeiculo = "disponivel" | "vendido" | "reservado" | "manutencao";
export type StatusVenda = "concluida" | "cancelada" | "pendente";
export type StatusParcela = "paga" | "em_aberto" | "atrasada";
export type PapelUsuario = "admin" | "vendedor";
export type TipoFornecedor = "pessoa_fisica" | "revendedora";

export interface Veiculo {
  id: string;
  empresaId: string;
  marca: string;
  modelo: string;
  ano: number;
  valor: number;
  status: StatusVeiculo;
  combustivel: string;
  cambio: string;
}

export interface Cliente {
  id: string;
  empresaId: string;
  nome: string;
  telefone: string;
  documento: string;
}

export interface Fornecedor {
  id: string;
  empresaId: string;
  nome: string;
  tipo: TipoFornecedor;
  documento: string;
  telefone: string;
}

export interface Vendedor {
  id: string;
  empresaId: string;
  nome: string;
  papel: PapelUsuario;
}

export interface Venda {
  id: string;
  empresaId: string;
  veiculoId: string;
  clienteId: string;
  vendedorId: string;
  data: string;
  valor: number;
  lucro: number;
  status: StatusVenda;
}

export interface Parcela {
  id: string;
  empresaId: string;
  vendaId: string;
  valor: number;
  vencimento: string;
  status: StatusParcela;
}
