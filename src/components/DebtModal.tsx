import { useEffect, useState, type MouseEvent } from "react";

const CATEGORIAS = [
  { value: "Casa", label: "🏠 Casa" },
  { value: "Lanchonete", label: "🍽️ Lanchonete" },
  { value: "Carro", label: "🚗 Carro" },
  { value: "Cartão", label: "💳 Cartão" },
  { value: "Água", label: "💧 Água" },
  { value: "Telefone", label: "📱 Telefone" },
  { value: "Outro", label: "📋 Outro" },
] as const;

export interface NovaDividaForm {
  desc: string;
  cat: string;
  valor: string;
  venc: string;
}

interface DebtModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: NovaDividaForm) => Promise<boolean>;
}

export function DebtModal({ open, onClose, onSave }: DebtModalProps) {
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState<string>(CATEGORIAS[0]!.value);
  const [valor, setValor] = useState("");
  const [venc, setVenc] = useState("");

  useEffect(() => {
    if (open) {
      setDesc("");
      setValor("");
      setVenc("");
      setCat(CATEGORIAS[0]!.value);
    }
  }, [open]);

  async function handleSalvar() {
    const ok = await onSave({ desc, cat, valor, venc });
    if (ok) onClose();
  }

  function overlayClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className={`modal-overlay${open ? " open" : ""}`}
      onClick={overlayClick}
      role="presentation"
    >
      <div className="modal">
        <h2>Nova dívida</h2>
        <div className="form-group">
          <label htmlFor="f-desc">Descrição</label>
          <input
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
            {CATEGORIAS.map((c) => (
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
          <button
            type="button"
            className="btn-salvar"
            onClick={() => void handleSalvar()}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
