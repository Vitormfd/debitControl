import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import type { Divida } from "../types/divida";
import { CATEGORIAS, categoriaConhecida } from "../constants/categorias";

export interface NovaDividaForm {
  desc: string;
  cat: string;
  valor: string;
  venc: string;
}

interface DebtModalProps {
  open: boolean;
  editing: Divida | null;
  onClose: () => void;
  onSubmit: (form: NovaDividaForm, editingId: string | null) => Promise<boolean>;
}

export function DebtModal({ open, editing, onClose, onSubmit }: DebtModalProps) {
  const titleId = useId();
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState<string>(CATEGORIAS[0]!.value);
  const [valor, setValor] = useState("");
  const [venc, setVenc] = useState("");
  const descRef = useRef<HTMLInputElement>(null);

  const catOptions = useMemo(() => {
    if (editing && !categoriaConhecida(editing.cat)) {
      return [{ value: editing.cat, label: editing.cat }, ...CATEGORIAS] as {
        value: string;
        label: string;
      }[];
    }
    return [...CATEGORIAS];
  }, [editing]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setDesc(editing.desc);
      setCat(editing.cat);
      setValor(
        Number.isFinite(editing.valor) ? String(editing.valor) : ""
      );
      setVenc(editing.venc ?? "");
    } else {
      setDesc("");
      setValor("");
      setVenc("");
      setCat(CATEGORIAS[0]!.value);
    }
  }, [open, editing]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => descRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, editing?.id]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSalvar(e?: FormEvent) {
    e?.preventDefault();
    const ok = await onSubmit(
      { desc, cat, valor, venc },
      editing?.id ?? null
    );
    if (ok) onClose();
  }

  function overlayClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const titulo = editing ? "Editar dívida" : "Nova dívida";

  return (
    <div
      className={`modal-overlay${open ? " open" : ""}`}
      onClick={overlayClick}
      role="presentation"
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId}>{titulo}</h2>
        <form onSubmit={(e) => void handleSalvar(e)}>
          <div className="form-group">
            <label htmlFor="f-desc">Descrição</label>
            <input
              ref={descRef}
              id="f-desc"
              type="text"
              placeholder="Ex: Luz casa abril"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="f-cat">Categoria</label>
            <select
              id="f-cat"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
            >
              {catOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="f-valor">Valor (R$)</label>
            <input
              id="f-valor"
              type="number"
              placeholder="0,00"
              step={0.01}
              min={0}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="f-data">Data de vencimento (opcional)</label>
            <input
              id="f-data"
              type="date"
              value={venc}
              onChange={(e) => setVenc(e.target.value)}
            />
          </div>
          <div className="modal-btns">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-salvar">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
