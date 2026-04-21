import { fmt } from "../utils/dividaHelpers";

interface SummaryCardsProps {
  totAtrasado: number;
  totSemana: number;
  totProximo: number;
  totPago: number;
}

export function SummaryCards({
  totAtrasado,
  totSemana,
  totProximo,
  totPago,
}: SummaryCardsProps) {
  return (
    <div className="summary">
      <div className="summary-card">
        <div className="label">🔴 Atrasado</div>
        <div className="value red">{fmt(totAtrasado)}</div>
      </div>
      <div className="summary-card">
        <div className="label">🟡 Esta semana</div>
        <div className="value orange">{fmt(totSemana)}</div>
      </div>
      <div className="summary-card">
        <div className="label">🔵 Próximos</div>
        <div className="value green">{fmt(totProximo)}</div>
      </div>
      <div className="summary-card">
        <div className="label">✅ Já pago</div>
        <div className="value purple">{fmt(totPago)}</div>
      </div>
    </div>
  );
}
