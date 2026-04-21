import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Divida, DividaRow, FiltroTipo } from "../types/divida";
import {
  mapRow,
  parseValorInput,
  totaisResumo,
} from "../utils/dividaHelpers";
import { DebtList } from "./DebtList";
import { DebtModal, type NovaDividaForm } from "./DebtModal";
import { FilterBar } from "./FilterBar";
import { SummaryCards } from "./SummaryCards";

interface DashboardProps {
  supabase: SupabaseClient;
  onSignOut: () => Promise<void>;
  subtitleHoje: string;
  onLoadError: (message: string) => void;
  onLoadStart: () => void;
}

export function Dashboard({
  supabase,
  onSignOut,
  subtitleHoje,
  onLoadError,
  onLoadStart,
}: DashboardProps) {
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTipo>("todos");
  const [syncMsg, setSyncMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadDividas = useCallback(async () => {
    onLoadStart();
    setSyncMsg("Sincronizando…");
    const { data, error } = await supabase
      .from("dividas")
      .select("*")
      .order("vencimento", { ascending: true, nullsFirst: false });

    if (error) {
      setDividas([]);
      setSyncMsg("");
      onLoadError(error.message);
      return;
    }
    const rows = (data ?? []) as DividaRow[];
    setDividas(rows.map(mapRow));
    setSyncMsg("Dados do Supabase");
  }, [supabase, onLoadError, onLoadStart]);

  useEffect(() => {
    void loadDividas();
  }, [loadDividas]);

  const { totAtrasado, totSemana, totProximo, totPago } =
    totaisResumo(dividas);

  async function togglePago(id: string) {
    const d = dividas.find((x) => x.id === id);
    if (!d) return;
    const next = !d.pago;
    const { error } = await supabase
      .from("dividas")
      .update({ pago: next })
      .eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setDividas((prev) =>
      prev.map((x) => (x.id === id ? { ...x, pago: next } : x))
    );
  }

  async function excluir(id: string) {
    if (!confirm("Remover essa dívida?")) return;
    const { error } = await supabase.from("dividas").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setDividas((prev) => prev.filter((x) => x.id !== id));
  }

  async function salvarDivida(form: NovaDividaForm): Promise<boolean> {
    const desc = form.desc.trim();
    const valor = parseValorInput(form.valor);
    const venc = form.venc.trim();

    if (!desc) {
      alert("Coloca uma descrição!");
      return false;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      alert("Coloca um valor válido!");
      return false;
    }

    const row = {
      descricao: desc,
      categoria: form.cat,
      valor,
      vencimento: venc || null,
      pago: false,
    };
    const { data, error } = await supabase
      .from("dividas")
      .insert(row)
      .select()
      .single();

    if (error) {
      alert(error.message);
      return false;
    }
    setDividas((prev) => [...prev, mapRow(data as DividaRow)]);
    return true;
  }

  async function handleSair() {
    setModalOpen(false);
    await onSignOut();
  }

  return (
    <div>
      <div className="app-top">
        <div>
          <h1>💰 Controle de Dívidas</h1>
          <p className="subtitle">{subtitleHoje}</p>
        </div>
        <button type="button" className="btn-sair" onClick={() => void handleSair()}>
          Sair
        </button>
      </div>
      <p className="sync-msg">{syncMsg}</p>

      <SummaryCards
        totAtrasado={totAtrasado}
        totSemana={totSemana}
        totProximo={totProximo}
        totPago={totPago}
      />

      <button
        type="button"
        className="btn-add"
        onClick={() => setModalOpen(true)}
      >
        + Adicionar dívida
      </button>

      <FilterBar filtroAtivo={filtroAtivo} onChange={setFiltroAtivo} />

      <DebtList
        dividas={dividas}
        filtroAtivo={filtroAtivo}
        onTogglePago={togglePago}
        onExcluir={excluir}
      />

      <DebtModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={salvarDivida}
      />
    </div>
  );
}
