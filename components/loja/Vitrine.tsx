"use client";

import { useMemo, useState } from "react";
import { useCarrinho } from "./CarrinhoProvider";
import { BarraCarrinho } from "./BotaoCarrinho";
import { FotoProduto } from "./FotoProduto";
import { formatBRL } from "@/lib/format";

export type ProdutoVitrine = {
  id: string;
  name: string;
  description: string | null;
  size_label: string | null;
  price_cents: number;
  image_path: string | null;
  imageUrl: string | null;
  category_id: string | null;
  category_name: string | null;
};

type Props = {
  produtos: ProdutoVitrine[];
  categorias: { id: string; name: string }[];
};

/** Remove acentos e caixa alta para a busca funcionar do jeito que a pessoa digita. */
function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function Vitrine({ produtos, categorias }: Props) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return produtos.filter((p) => {
      if (categoria && p.category_id !== categoria) return false;
      if (!termo) return true;
      const alvo = normalizar(`${p.name} ${p.description ?? ""} ${p.category_name ?? ""}`);
      return termo.split(/\s+/).every((parte) => alvo.includes(parte));
    });
  }, [produtos, busca, categoria]);

  if (produtos.length === 0) {
    return (
      <div className="cartao mt-6 p-8 text-center">
        <p className="text-4xl">🧼</p>
        <h2 className="mt-3 text-lg font-bold text-slate-800">
          A loja está sendo preparada
        </h2>
        <p className="mt-1 text-slate-600">
          Os produtos aparecem aqui assim que forem cadastrados. Volte daqui a pouco!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <label className="relative block">
          <span className="sr-only">Buscar produto</span>
          <svg
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="campo pl-10"
          />
        </label>

        {categorias.length > 0 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            <Chip ativo={categoria === null} onClick={() => setCategoria(null)}>
              Todos
            </Chip>
            {categorias.map((c) => (
              <Chip
                key={c.id}
                ativo={categoria === c.id}
                onClick={() => setCategoria(categoria === c.id ? null : c.id)}
              >
                {c.name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {filtrados.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">
          Nenhum produto encontrado para essa busca.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {filtrados.map((p) => (
            <CardProduto key={p.id} produto={p} />
          ))}
        </ul>
      )}

      <div className="-mx-4 mt-6">
        <BarraCarrinho />
      </div>
    </>
  );
}

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        ativo
          ? "border-marca-600 bg-marca-600 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function CardProduto({ produto }: { produto: ProdutoVitrine }) {
  const { quantidadeDe, definirQuantidade } = useCarrinho();
  const quantidade = quantidadeDe(produto.id);

  const dados = {
    productId: produto.id,
    name: produto.name,
    priceCents: produto.price_cents,
    sizeLabel: produto.size_label,
    imagePath: produto.image_path,
  };

  return (
    <li className="cartao flex gap-3 overflow-hidden p-3">
      <FotoProduto
        url={produto.imageUrl}
        nome={produto.name}
        className="h-24 w-24 shrink-0 rounded-xl"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="leading-snug font-semibold text-slate-900">{produto.name}</h3>
        {produto.size_label && (
          <p className="text-xs font-medium text-agua-700">{produto.size_label}</p>
        )}
        {produto.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{produto.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="text-lg font-bold text-slate-900">{formatBRL(produto.price_cents)}</p>

          {quantidade === 0 ? (
            <button
              type="button"
              onClick={() => definirQuantidade(dados, 1)}
              className="btn-primario btn-sm"
            >
              Adicionar
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-lg border border-marca-200 bg-marca-50">
              <BotaoQtd
                rotulo={`Diminuir ${produto.name}`}
                onClick={() => definirQuantidade(dados, quantidade - 1)}
              >
                −
              </BotaoQtd>
              <span className="w-6 text-center font-bold text-marca-800">{quantidade}</span>
              <BotaoQtd
                rotulo={`Aumentar ${produto.name}`}
                onClick={() => definirQuantidade(dados, quantidade + 1)}
              >
                +
              </BotaoQtd>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function BotaoQtd({
  rotulo,
  onClick,
  children,
}: {
  rotulo: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-lg text-xl leading-none font-bold text-marca-700 hover:bg-marca-100"
    >
      {children}
    </button>
  );
}
