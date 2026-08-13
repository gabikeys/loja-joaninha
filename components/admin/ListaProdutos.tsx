"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FormAcao, BotaoSubmit } from "@/components/ui/FormAcao";
import { formatBRL } from "@/lib/format";
import type { ProductWithCategory } from "@/lib/types";
import { productImageUrl } from "@/lib/env";
import {
  alternarProdutoAtivo,
  duplicarProduto,
  excluirProduto,
  moverProduto,
} from "@/app/admin/(painel)/produtos/acoes";

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function ListaProdutos({ produtos }: { produtos: ProductWithCategory[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return produtos;
    return produtos.filter((p) =>
      normalizar(`${p.name} ${p.description ?? ""} ${p.categories?.name ?? ""}`).includes(termo)
    );
  }, [produtos, busca]);

  if (produtos.length === 0) {
    return (
      <div className="cartao p-8 text-center">
        <p className="text-5xl">🧴</p>
        <h2 className="mt-3 text-lg font-bold text-slate-900">
          Sua loja ainda não tem produtos
        </h2>
        <p className="mt-2 text-slate-600">
          Vamos cadastrar o primeiro? É rapidinho: tire a foto, escreva o nome e coloque o preço.
        </p>
        <Link href="/admin/produtos/novo" className="btn-primario mt-5 w-full">
          Cadastrar meu primeiro produto
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar nos seus produtos..."
        className="campo"
        aria-label="Buscar produto"
      />

      {filtrados.length === 0 ? (
        <p className="py-8 text-center text-slate-500">
          Nenhum produto com esse nome.
        </p>
      ) : (
        <ul className="space-y-2">
          {filtrados.map((produto) => (
            <li
              key={produto.id}
              className={`cartao p-3 ${produto.active ? "" : "border-dashed bg-slate-50"}`}
            >
              <div className="flex gap-3">
                <div className="flex flex-col justify-center">
                  <FormAcao action={moverProduto}>
                    <input type="hidden" name="id" value={produto.id} />
                    <input type="hidden" name="direcao" value="cima" />
                    <BotaoSubmit
                      className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`Subir ${produto.name}`}
                      ocupado="·"
                    >
                      ▲
                    </BotaoSubmit>
                  </FormAcao>
                  <FormAcao action={moverProduto}>
                    <input type="hidden" name="id" value={produto.id} />
                    <input type="hidden" name="direcao" value="baixo" />
                    <BotaoSubmit
                      className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`Descer ${produto.name}`}
                      ocupado="·"
                    >
                      ▼
                    </BotaoSubmit>
                  </FormAcao>
                </div>

                <Link
                  href={`/admin/produtos/${produto.id}`}
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-xl"
                >
                  {produto.image_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={productImageUrl(produto.image_path) ?? ""}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center bg-agua-50 text-xl">
                      🧴
                    </span>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link href={`/admin/produtos/${produto.id}`} className="block">
                    <p className="truncate font-semibold text-slate-900">{produto.name}</p>
                    <p className="font-bold text-slate-800">{formatBRL(produto.price_cents)}</p>
                    <p className="truncate text-xs text-slate-500">
                      {produto.categories?.name ?? "Sem categoria"}
                      {produto.size_label ? ` · ${produto.size_label}` : ""}
                    </p>
                  </Link>
                  {!produto.active && (
                    <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      Escondido da loja
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                <Link href={`/admin/produtos/${produto.id}`} className="btn-secundario btn-sm">
                  Editar
                </Link>

                <FormAcao action={alternarProdutoAtivo}>
                  <input type="hidden" name="id" value={produto.id} />
                  <input type="hidden" name="ativar" value={produto.active ? "0" : "1"} />
                  <BotaoSubmit className="btn-secundario btn-sm" ocupado="...">
                    {produto.active ? "Esconder da loja" : "Mostrar na loja"}
                  </BotaoSubmit>
                </FormAcao>

                <FormAcao action={duplicarProduto}>
                  <input type="hidden" name="id" value={produto.id} />
                  <BotaoSubmit className="btn-secundario btn-sm" ocupado="...">
                    Duplicar
                  </BotaoSubmit>
                </FormAcao>

                <FormAcao
                  action={excluirProduto}
                  confirmar={`Excluir "${produto.name}" para sempre?\n\nSe você só quer tirar da loja por um tempo, use "Esconder da loja".`}
                  className="ml-auto"
                >
                  <input type="hidden" name="id" value={produto.id} />
                  <BotaoSubmit className="btn-perigo btn-sm" ocupado="...">
                    Excluir
                  </BotaoSubmit>
                </FormAcao>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
