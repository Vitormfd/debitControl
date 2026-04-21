import type { ReactNode } from "react";
import type { Divida } from "../types/divida";
import { computeStatus, fmt, fmtData } from "../utils/dividaHelpers";

interface DebtListProps {
  items: Divida[];
  onTogglePago: (id: string) => void;
  onExcluir: (d: Divida) => void;
  onEditar: (d: Divida) => void;
}

export function DebtList({
  items,
  onTogglePago,
  onExcluir,
  onEditar,
}: DebtListProps) {
  if (items.length === 0) {
    return <p className="empty">Nenhuma dívida encontrada 🎉</p>;
  }

  const cats = [...new Set(items.map((d) => d.cat))].sort();

  return (
    <div>
      {cats.map((cat) => {
        const inCat = items.filter((d) => d.cat === cat);
        const totalGrupo = inCat.reduce((s, d) => s + d.valor, 0);
        return (
          <div key={cat}>
            <div className="grupo-titulo">
              {cat}{" "}
              <span style={{ fontWeight: 400, color: "#bbb" }}>
                — {fmt(totalGrupo)}
              </span>
            </div>
            {inCat.map((d) => {
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
                    className="btn-editar"
                    aria-label={`Editar ${d.desc}`}
                    title="Editar"
                    onClick={() => onEditar(d)}
                  >
                    ✎
                  </button>
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
                    aria-label={`Excluir ${d.desc}`}
                    onClick={() => void onExcluir(d)}
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
