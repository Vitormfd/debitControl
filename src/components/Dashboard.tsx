import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useToast } from "../context/ToastContext";
import type { Divida, DividaRow, FiltroTipo, Ordenacao } from "../types/divida";
import {
  filtrarBusca,
  filtrarPorFiltro,
  mapRow,
  parseValorInput,
  sortDividasLista,
  totaisResumo,
} from "../utils/dividaHelpers";
import { ConfirmDialog } from "./ConfirmDialog";
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
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTipo>("todos");
  const [syncMsg, setSyncMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Divida | null>(null);
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("venc_asc");
  const [pendingDelete, setPendingDelete] = useState<Divida | null>(null);

  const { data: dividas = [], isFetching, isFetched } = useQuery({
    queryKey: ["dividas"],
    queryFn: async (): Promise<Divida[]> => {
      onLoadStart();
      const { data, error } = await supabase
        .from("dividas")
        .select("*")
        .order("vencimento", { ascending: true, nullsFirst: false });

      if (error) {
        onLoadError(error.message);
        return [];
      }
      const rows = (data ?? []) as DividaRow[];
      return rows.map(mapRow);
    },
  });

  useEffect(() => {
    if (isFetching) setSyncMsg("Sincronizando…");
    else if (isFetched) setSyncMsg("Dados do Supabase");
  }, [isFetching, isFetched]);

  const itensVisiveis = useMemo(() => {
    let list = filtrarBusca(dividas, busca);
    list = filtrarPorFiltro(list, filtroAtivo);
    return sortDividasLista(list, ordenacao);
  }, [dividas, busca, filtroAtivo, ordenacao]);

  const { totAtrasado, totSemana, totProximo, totPago } =
    totaisResumo(dividas);

  const toggleMutation = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: boolean }) => {
      const { error } = await supabase
        .from("dividas")
        .update({ pago: next })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dividas"] });
    },
    onError: (e) => {
      showToast(e instanceof Error ? e.message : "Erro ao atualizar status.", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dividas").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dividas"] });
      showToast("Dívida removida.", "success");
    },
    onError: (e) => {
      showToast(e instanceof Error ? e.message : "Erro ao excluir.", "error");
    },
  });

  function togglePago(id: string) {
    const d = dividas.find((x) => x.id === id);
    if (!d) return;
    toggleMutation.mutate({ id, next: !d.pago });
  }

  function solicitarExclusao(d: Divida) {
    setPendingDelete(d);
  }

  function confirmarExclusao() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    deleteMutation.mutate(id);
  }

  async function submitDivida(
    form: NovaDividaForm,
    editingId: string | null
  ): Promise<boolean> {
    const desc = form.desc.trim();
    const valor = parseValorInput(form.valor);
    const venc = form.venc.trim();

    if (!desc) {
      showToast("Informe uma descrição.", "error");
      return false;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      showToast("Informe um valor válido maior que zero.", "error");
      return false;
    }

    if (!editingId) {
      const row = {
        descricao: desc,
        categoria: form.cat,
        valor,
        vencimento: venc || null,
        pago: false,
      };
      const { error } = await supabase
        .from("dividas")
        .insert(row)
        .select()
        .single();
      if (error) {
        showToast(error.message, "error");
        return false;
      }
      await queryClient.invalidateQueries({ queryKey: ["dividas"] });
      showToast("Dívida criada.", "success");
      return true;
    }

    const { error } = await supabase
      .from("dividas")
      .update({
        descricao: desc,
        categoria: form.cat,
        valor,
        vencimento: venc || null,
      })
      .eq("id", editingId);

    if (error) {
      showToast(error.message, "error");
      return false;
    }
    await queryClient.invalidateQueries({ queryKey: ["dividas"] });
    showToast("Dívida atualizada.", "success");
    return true;
  }

  async function handleSair() {
    setModalOpen(false);
    await onSignOut();
  }

  function abrirNova() {
    setEditing(null);
    setModalOpen(true);
  }

  function abrirEditar(d: Divida) {
    setEditing(d);
    setModalOpen(true);
  }

  function fecharModal() {
    setModalOpen(false);
    setEditing(null);
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

      <button type="button" className="btn-add" onClick={abrirNova}>
        + Adicionar dívida
      </button>

      <FilterBar filtroAtivo={filtroAtivo} onChange={setFiltroAtivo} />

      <div className="list-toolbar">
        <input
          type="search"
          className="input-busca"
          placeholder="Buscar por descrição ou categoria…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar dívidas"
        />
        <div className="list-toolbar-sort">
          <label htmlFor="ordenacao">Ordenar</label>
          <select
            id="ordenacao"
            className="select-ordenacao"
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
          >
            <option value="venc_asc">Vencimento (mais próximo)</option>
            <option value="venc_desc">Vencimento (mais distante)</option>
            <option value="urgencia">Urgência (atrasados primeiro)</option>
            <option value="valor_desc">Valor (maior)</option>
            <option value="valor_asc">Valor (menor)</option>
          </select>
        </div>
      </div>

      <DebtList
        items={itensVisiveis}
        onTogglePago={togglePago}
        onExcluir={solicitarExclusao}
        onEditar={abrirEditar}
      />

      <DebtModal
        open={modalOpen}
        editing={editing}
        onClose={fecharModal}
        onSubmit={submitDivida}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remover dívida?"
        message={
          pendingDelete
            ? `Esta ação não pode ser desfeita. Remover “${pendingDelete.desc}”?`
            : ""
        }
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}
