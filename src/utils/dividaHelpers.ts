import type {
  Divida,
  DividaRow,
  DividaStatus,
  FiltroTipo,
  Ordenacao,
} from "../types/divida";

export function todayMidnight(): Date {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

export function parseLocalDate(iso: string | null | undefined): Date | null {
  if (!iso || !String(iso).trim()) return null;
  const parts = String(iso).split("-").map(Number);
  if (parts.length < 3) return null;
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (y === undefined || m === undefined || d === undefined) return null;
  if ([y, m, d].some((n) => Number.isNaN(n))) return null;
  return new Date(y, m - 1, d);
}

export function startOfWeekMonday(ref: Date): Date {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeekMonday(ref: Date): Date {
  const s = startOfWeekMonday(ref);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

export function computeStatus(d: Divida): DividaStatus {
  if (d.pago) return "pago";
  const v = parseLocalDate(d.venc);
  const today = todayMidnight();
  if (!v) return "proximo";
  const vd = new Date(v.getFullYear(), v.getMonth(), v.getDate());
  if (vd < today) return "atrasado";
  if (vd.getTime() === today.getTime()) return "vence-hoje";
  const end = endOfWeekMonday(today);
  if (vd >= today && vd <= end) return "essa-semana";
  return "proximo";
}

export function mapRow(r: DividaRow): Divida {
  const v = r.valor;
  const num = typeof v === "string" ? parseFloat(v) : Number(v);
  return {
    id: r.id,
    desc: r.descricao,
    cat: r.categoria,
    valor: Number.isFinite(num) ? num : 0,
    venc: r.vencimento ? String(r.vencimento).slice(0, 10) : "",
    pago: !!r.pago,
  };
}

export function fmt(v: number): string {
  return (
    "R$ " +
    v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  );
}

export function fmtData(str: string): string {
  if (!str) return "Sem data";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

export function parseValorInput(raw: string): number {
  const s = String(raw || "")
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");
  return parseFloat(s);
}

export function totaisResumo(dividas: Divida[]): {
  totAtrasado: number;
  totSemana: number;
  totProximo: number;
  totPago: number;
} {
  let totAtrasado = 0;
  let totSemana = 0;
  let totProximo = 0;
  let totPago = 0;
  dividas.forEach((d) => {
    if (d.pago) {
      totPago += d.valor;
      return;
    }
    const s = computeStatus(d);
    if (s === "atrasado") totAtrasado += d.valor;
    else if (s === "essa-semana" || s === "vence-hoje") totSemana += d.valor;
    else if (s === "proximo") totProximo += d.valor;
  });
  return { totAtrasado, totSemana, totProximo, totPago };
}

export function cmpVenc(a: Divida, b: Divida): number {
  if (!a.venc && !b.venc) return 0;
  if (!a.venc) return 1;
  if (!b.venc) return -1;
  return a.venc.localeCompare(b.venc);
}

const URGENCY: Record<DividaStatus, number> = {
  atrasado: 0,
  "vence-hoje": 1,
  "essa-semana": 2,
  proximo: 3,
  pago: 4,
};

export function statusUrgencyRank(status: DividaStatus): number {
  return URGENCY[status];
}

export function cmpDividaOrdenacao(
  a: Divida,
  b: Divida,
  ordenacao: Ordenacao
): number {
  if (a.pago !== b.pago) return a.pago ? 1 : -1;
  switch (ordenacao) {
    case "venc_asc":
      return cmpVenc(a, b);
    case "venc_desc":
      return cmpVenc(b, a);
    case "valor_asc":
      return a.valor - b.valor;
    case "valor_desc":
      return b.valor - a.valor;
    case "urgencia": {
      const r =
        statusUrgencyRank(computeStatus(a)) - statusUrgencyRank(computeStatus(b));
      return r !== 0 ? r : cmpVenc(a, b);
    }
    default:
      return cmpVenc(a, b);
  }
}

export function sortDividasLista(list: Divida[], ordenacao: Ordenacao): Divida[] {
  return list.slice().sort((a, b) => cmpDividaOrdenacao(a, b, ordenacao));
}

export function filtrarBusca(dividas: Divida[], busca: string): Divida[] {
  const q = busca.trim().toLowerCase();
  if (!q) return dividas.slice();
  return dividas.filter(
    (d) =>
      d.desc.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q)
  );
}

export function filtrarPorFiltro(
  dividas: Divida[],
  filtroAtivo: FiltroTipo
): Divida[] {
  if (filtroAtivo === "todos") return dividas.slice();
  if (filtroAtivo === "pago") return dividas.filter((d) => d.pago);
  return dividas.filter((d) => {
    if (d.pago) return false;
    const s = computeStatus(d);
    if (filtroAtivo === "essa-semana")
      return s === "essa-semana" || s === "vence-hoje";
    return s === filtroAtivo;
  });
}
