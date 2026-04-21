import type { ReactNode } from "react";
import type { Divida, FiltroTipo } from "../types/divida";
import {
  cmpVenc,
  computeStatus,
  fmt,
  fmtData,
} from "../utils/dividaHelpers";

interface DebtListProps {
  dividas: Divida[];
  filtroAtivo: FiltroTipo;
  onTogglePago: (id: string) => void;
  onExcluir: (id: string) => void;
}

function listaFiltrada(dividas: Divida[], filtroAtivo: FiltroTipo): Divida[] {
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

export function DebtList({
  dividas,
  filtroAtivo,
  onTogglePago,
  onExcluir,
}: DebtListProps) {
  let lista = listaFiltrada(dividas, filtroAtivo);
  lista = lista.slice().sort((a, b) => {
    if (a.pago !== b.pago) return a.pago ? 1 : -1;
    return cmpVenc(a, b);
  });

  if (lista.length === 0) {
    return <p className="empty">Nenhuma dívida encontrada 🎉</p>;
  }

  const grupos: Record<string, Divida[]> = {};
  lista.forEach((d) => {
    const bucket = grupos[d.cat] ?? (grupos[d.cat] = []);
    bucket.push(d);
  });

  const cats = Object.keys(grupos).sort();

  return (
    <div>
      {cats.map((cat) => {
        const raw = grupos[cat];
        if (!raw) return null;
        const items = raw.slice().sort(cmpVenc);
        const totalGrupo = items.reduce((s, d) => s + d.valor, 0);
        return (
          <div key={cat}>
            <div className="grupo-titulo">
              {cat}{" "}
              <span style={{ fontWeight: 400, color: "#bbb" }}>
                — {fmt(totalGrupo)}
              </span>
            </div>
            {items.map((d) => {
              const st = computeStatus(d);
              const statusClass = d.pago ? "pago" : st;
              const btnTxt = d.pago ? "Desfazer" : "Marcar pago";
              const btnClass = d.pago ? "btn-pagar desfazer" : "btn-pagar";

              let badge: ReactNode = null;
              if (!d.pago) {
                if (st === "atrasado")
                  badge = <span className="badge atrasado">ATRASADO</span>;
                else if (st === "vence-hoje")
                  badge = <span className="badge vence-hoje">HOJE</span>;
                else if (st === "essa-semana")
                  badge = <span className="badge essa-semana">ESTA SEMANA</span>;
              } else {
                badge = <span className="badge pago">PAGO ✓</span>;
              }

              return (
                <div
                  key={d.id}
                  className={`divida-item${d.pago ? " pago" : ""}`}
                >
                  <div className={`dot ${statusClass}`} />
                  <div className="divida-info">
                    <div className="divida-desc">
                      {d.desc}
                      {badge}
                    </div>
                    <div className="divida-meta">
                      Vence: {fmtData(d.venc)} · {d.cat}
                    </div>
                  </div>
                  <div className="divida-valor">{fmt(d.valor)}</div>
                  <button
                    type="button"
                    className={btnClass}
                    onClick={() => void onTogglePago(d.id)}
                  >
                    {btnTxt}
                  </button>
                  <button
                    type="button"
                    className="btn-excluir"
                    title="Excluir"
                    onClick={() => void onExcluir(d.id)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
