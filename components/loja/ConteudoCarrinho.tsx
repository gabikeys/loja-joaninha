"use client";

import Link from "next/link";
import { useCarrinho } from "./CarrinhoProvider";
import { FotoProduto } from "./FotoProduto";
import { formatBRL } from "@/lib/format";
import { productImageUrl } from "@/lib/env";

export function ConteudoCarrinho({ infoEntrega }: { infoEntrega: string }) {
  const { itens, carregado, definirQuantidade, remover, totalCentavos, limpar } = useCarrinho();

  if (!carregado) {
    return <p className="py-10 text-center text-slate-400">Carregando seu carrinho...</p>;
  }

  if (itens.length === 0) {
    return (
      <div className="cartao mt-6 p-8 text-center">
        <p className="text-4xl">🛒</p>
        <h1 className="mt-3 text-lg font-bold text-slate-800">Seu carrinho está vazio</h1>
        <p className="mt-1 text-slate-600">Escolha seus produtos de limpeza para começar.</p>
        <Link href="/" className="btn-primario mt-5 w-full">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Seu carrinho</h1>

      <ul className="space-y-3">
        {itens.map((item) => (
          <li key={item.productId} className="cartao flex gap-3 p-3">
            <FotoProduto
              url={productImageUrl(item.imagePath)}
              nome={item.name}
              className="h-20 w-20 shrink-0 rounded-xl"
            />

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="leading-snug font-semibold text-slate-900">{item.name}</h2>
                  {item.sizeLabel && (
                    <p className="text-xs font-medium text-agua-700">{item.sizeLabel}</p>
                  )}
                  <p className="text-sm text-slate-500">{formatBRL(item.priceCents)} cada</p>
                </div>
                <button
                  type="button"
                  onClick={() => remover(item.productId)}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remover ${item.name} do carrinho`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-1 rounded-lg border border-slate-300">
                  <button
                    type="button"
                    aria-label={`Diminuir ${item.name}`}
                    onClick={() =>
                      definirQuantidade(
                        {
                          productId: item.productId,
                          name: item.name,
                          priceCents: item.priceCents,
                          sizeLabel: item.sizeLabel,
                          imagePath: item.imagePath,
                        },
                        item.quantity - 1
                      )
                    }
                    className="grid h-9 w-9 place-items-center rounded-lg text-xl font-bold text-slate-700 hover:bg-slate-100"
                  >
                    −
                  </button>
                  <span className="w-7 text-center font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Aumentar ${item.name}`}
                    onClick={() =>
                      definirQuantidade(
                        {
                          productId: item.productId,
                          name: item.name,
                          priceCents: item.priceCents,
                          sizeLabel: item.sizeLabel,
                          imagePath: item.imagePath,
                        },
                        item.quantity + 1
                      )
                    }
                    className="grid h-9 w-9 place-items-center rounded-lg text-xl font-bold text-slate-700 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>

                <p className="font-bold text-slate-900">
                  {formatBRL(item.priceCents * item.quantity)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="cartao space-y-2 p-4">
        <div className="flex justify-between text-slate-600">
          <span>Produtos</span>
          <span>{formatBRL(totalCentavos)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Entrega</span>
          <span className="text-right text-sm">{infoEntrega}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-900">
          <span>Total</span>
          <span>{formatBRL(totalCentavos)}</span>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 space-y-2 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
        <Link href="/checkout" className="btn-primario w-full">
          Finalizar pedido
        </Link>
        <div className="flex gap-2">
          <Link href="/" className="btn-secundario btn-sm flex-1">
            Continuar comprando
          </Link>
          <button type="button" onClick={limpar} className="btn-secundario btn-sm">
            Esvaziar
          </button>
        </div>
      </div>
    </div>
  );
}
