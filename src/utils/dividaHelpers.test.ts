import { describe, expect, it } from "vitest";
import type { Divida } from "../types/divida";
import {
  cmpVenc,
  computeStatus,
  filtrarBusca,
  filtrarPorFiltro,
  parseValorInput,
  sortDividasLista,
  totaisResumo,
} from "./dividaHelpers";

function d(partial: Partial<Divida> & Pick<Divida, "id" | "desc" | "valor">): Divida {
  return {
    cat: "Casa",
    venc: "",
    pago: false,
    ...partial,
  };
}

describe("parseValorInput", () => {
  it("aceita vírgula decimal", () => {
    expect(parseValorInput("10,50")).toBe(10.5);
  });
  it("aceita ponto", () => {
    expect(parseValorInput(" 100.25 ")).toBe(100.25);
  });
});

describe("computeStatus", () => {
  it("retorna pago quando marcado", () => {
    const x = d({
      id: "1",
      desc: "x",
      valor: 1,
      venc: "2099-01-01",
      pago: true,
    });
    expect(computeStatus(x)).toBe("pago");
  });
});

describe("totaisResumo", () => {
  it("soma pago separado", () => {
    const r = totaisResumo([
      d({ id: "1", desc: "a", valor: 10, pago: true }),
      d({ id: "2", desc: "b", valor: 5, pago: false, venc: "2099-12-01" }),
    ]);
    expect(r.totPago).toBe(10);
    expect(r.totProximo).toBe(5);
  });
});

describe("filtrarBusca", () => {
  it("filtra por descrição", () => {
    const list = [
      d({ id: "1", desc: "Luz abril", valor: 1 }),
      d({ id: "2", desc: "Água", valor: 2 }),
    ];
    expect(filtrarBusca(list, "luz")).toHaveLength(1);
  });
});

describe("filtrarPorFiltro", () => {
  it("retorna só pagos", () => {
    const list = [
      d({ id: "1", desc: "a", valor: 1, pago: true }),
      d({ id: "2", desc: "b", valor: 2, pago: false }),
    ];
    expect(filtrarPorFiltro(list, "pago")).toHaveLength(1);
  });
});

describe("sortDividasLista", () => {
  it("ordena por valor decrescente", () => {
    const list = [
      d({ id: "1", desc: "a", valor: 10, pago: false }),
      d({ id: "2", desc: "b", valor: 50, pago: false }),
    ];
    const s = sortDividasLista(list, "valor_desc");
    expect(s[0]!.valor).toBe(50);
  });
});

describe("cmpVenc", () => {
  it("sem data vai para o fim entre não pagos", () => {
    const a = d({ id: "1", desc: "a", valor: 1, venc: "" });
    const b = d({ id: "2", desc: "b", valor: 1, venc: "2099-01-01" });
    expect(cmpVenc(a, b)).toBeGreaterThan(0);
  });
});
