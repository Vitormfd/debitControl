export type DividaStatus =
  | "atrasado"
  | "vence-hoje"
  | "essa-semana"
  | "proximo"
  | "pago";

export type FiltroTipo = "todos" | "atrasado" | "essa-semana" | "proximo" | "pago";

export type Ordenacao =
  | "venc_asc"
  | "venc_desc"
  | "valor_asc"
  | "valor_desc"
  | "urgencia";

export interface Divida {
  id: string;
  desc: string;
  cat: string;
  valor: number;
  venc: string;
  pago: boolean;
}

export interface DividaRow {
  id: string;
  descricao: string;
  categoria: string;
  valor: string | number;
  vencimento: string | null;
  pago: boolean;
}
