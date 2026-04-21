import type { FiltroTipo } from "../types/divida";

interface FilterBarProps {
  filtroAtivo: FiltroTipo;
  onChange: (tipo: FiltroTipo) => void;
}

const FILTROS: { tipo: FiltroTipo; label: string }[] = [
  { tipo: "todos", label: "Todos" },
  { tipo: "atrasado", label: "Atrasados" },
  { tipo: "essa-semana", label: "Essa semana" },
  { tipo: "proximo", label: "Próximos" },
  { tipo: "pago", label: "Pagos" },
];

export function FilterBar({ filtroAtivo, onChange }: FilterBarProps) {
  return (
    <div className="filters">
      {FILTROS.map(({ tipo, label }) => (
        <button
          key={tipo}
          type="button"
          className={`filter-btn${filtroAtivo === tipo ? " active" : ""}`}
          onClick={() => onChange(tipo)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
