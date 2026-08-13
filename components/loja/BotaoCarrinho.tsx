"use client";

import Link from "next/link";
import { useCarrinho } from "./CarrinhoProvider";
import { formatBRL } from "@/lib/format";

/** Ícone do carrinho no cabeçalho, com a quantidade de itens. */
export function BotaoCarrinho() {
  const { totalItens } = useCarrinho();

  return (
    <Link
      href="/carrinho"
      className="relative flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 font-semibold text-white transition-colors hover:bg-white/25"
      aria-label={`Carrinho com ${totalItens} ${totalItens === 1 ? "item" : "itens"}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 4h2l2.4 10.4a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.55L20.5 8H6.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="20" r="1.4" fill="currentColor" />
        <circle cx="17.5" cy="20" r="1.4" fill="currentColor" />
      </svg>
      {totalItens > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-marca-700">
          {totalItens}
        </span>
      )}
    </Link>
  );
}

/**
 * Barra fixa no rodapé do celular com o total e o botão de ir para o carrinho.
 * Só aparece quando há alguma coisa dentro.
 */
export function BarraCarrinho() {
  const { totalItens, totalCentavos } = useCarrinho();
  if (totalItens === 0) return null;

  return (
    <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
      <Link
        href="/carrinho"
        className="btn-primario w-full justify-between px-5 shadow-lg shadow-marca-600/20"
      >
        <span>
          Ver carrinho · {totalItens} {totalItens === 1 ? "item" : "itens"}
        </span>
        <span>{formatBRL(totalCentavos)}</span>
      </Link>
    </div>
  );
}
