"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/lib/types";

const CHAVE = "joaninha:carrinho:v1";

type CarrinhoContexto = {
  itens: CartLine[];
  carregado: boolean;
  quantidadeDe: (productId: string) => number;
  definirQuantidade: (item: Omit<CartLine, "quantity">, quantidade: number) => void;
  adicionar: (item: Omit<CartLine, "quantity">, quantidade?: number) => void;
  remover: (productId: string) => void;
  limpar: () => void;
  totalItens: number;
  totalCentavos: number;
};

const Ctx = createContext<CarrinhoContexto | null>(null);

function ler(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return [];
    const dados = JSON.parse(bruto);
    if (!Array.isArray(dados)) return [];
    return dados.filter(
      (i): i is CartLine =>
        typeof i?.productId === "string" &&
        typeof i?.priceCents === "number" &&
        typeof i?.quantity === "number" &&
        i.quantity > 0
    );
  } catch {
    return [];
  }
}

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<CartLine[]>([]);
  const [carregado, setCarregado] = useState(false);

  // O carrinho só existe no navegador; carregamos depois da primeira pintura
  // para o HTML do servidor e o do cliente não divergirem.
  useEffect(() => {
    setItens(ler());
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(itens));
    } catch {
      // localStorage cheio ou bloqueado — o carrinho segue funcionando na sessão.
    }
  }, [itens, carregado]);

  const definirQuantidade = useCallback(
    (item: Omit<CartLine, "quantity">, quantidade: number) => {
      const q = Math.max(0, Math.min(99, Math.floor(quantidade)));
      setItens((atual) => {
        const existente = atual.find((i) => i.productId === item.productId);
        if (q === 0) return atual.filter((i) => i.productId !== item.productId);
        if (!existente) return [...atual, { ...item, quantity: q }];
        return atual.map((i) =>
          i.productId === item.productId ? { ...i, ...item, quantity: q } : i
        );
      });
    },
    []
  );

  const adicionar = useCallback(
    (item: Omit<CartLine, "quantity">, quantidade = 1) => {
      setItens((atual) => {
        const existente = atual.find((i) => i.productId === item.productId);
        const nova = Math.min(99, (existente?.quantity ?? 0) + quantidade);
        if (!existente) return [...atual, { ...item, quantity: nova }];
        return atual.map((i) =>
          i.productId === item.productId ? { ...i, ...item, quantity: nova } : i
        );
      });
    },
    []
  );

  const remover = useCallback((productId: string) => {
    setItens((atual) => atual.filter((i) => i.productId !== productId));
  }, []);

  const limpar = useCallback(() => setItens([]), []);

  const valor = useMemo<CarrinhoContexto>(() => {
    const totalItens = itens.reduce((s, i) => s + i.quantity, 0);
    const totalCentavos = itens.reduce((s, i) => s + i.quantity * i.priceCents, 0);
    return {
      itens,
      carregado,
      quantidadeDe: (id) => itens.find((i) => i.productId === id)?.quantity ?? 0,
      definirQuantidade,
      adicionar,
      remover,
      limpar,
      totalItens,
      totalCentavos,
    };
  }, [itens, carregado, definirQuantidade, adicionar, remover, limpar]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useCarrinho() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCarrinho precisa estar dentro de <CarrinhoProvider>");
  return ctx;
}
