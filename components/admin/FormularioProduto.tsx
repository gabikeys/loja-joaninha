"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CampoFoto } from "./CampoFoto";
import { Campo } from "@/components/ui/Campo";
import { BotaoSubmit } from "@/components/ui/FormAcao";
import { ESTADO_INICIAL } from "@/lib/estado-acao";
import { productImageUrl } from "@/lib/env";
import { formatBRL } from "@/lib/format";
import { mascaraDinheiro } from "@/lib/mascaras";
import type { Category, Product } from "@/lib/types";
import { salvarProduto } from "@/app/admin/(painel)/produtos/acoes";

type Props = {
  produto?: Product;
  categorias: Category[];
};

export function FormularioProduto({ produto, categorias }: Props) {
  const [estado, acao] = useActionState(salvarProduto, ESTADO_INICIAL);

  const [nome, setNome] = useState(produto?.name ?? "");
  const [descricao, setDescricao] = useState(produto?.description ?? "");
  const [tamanho, setTamanho] = useState(produto?.size_label ?? "");
  const [preco, setPreco] = useState(
    produto ? mascaraDinheiro(String(produto.price_cents)) : ""
  );
  const [categoriaId, setCategoriaId] = useState(produto?.category_id ?? "");
  const [ativo, setAtivo] = useState(produto?.active ?? true);
  const [preview, setPreview] = useState<string | null>(
    productImageUrl(produto?.image_path ?? null)
  );

  const centavos = Number(preco.replace(/\D/g, "")) || 0;

  return (
    <form action={acao} className="space-y-5 pb-4">
      {produto && <input type="hidden" name="id" value={produto.id} />}

      {estado.erro && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
          {estado.erro}
        </p>
      )}

      <section className="cartao space-y-4 p-4">
        <CampoFoto
          caminhoInicial={produto?.image_path ?? null}
          aoMudar={(_caminho, url) => setPreview(url)}
        />

        <Campo
          id="nome"
          label="Nome do produto"
          obrigatorio
          erro={estado.campos?.name}
          ajuda="É o nome que o cliente vê. Ex: Detergente neutro"
        >
          <input
            id="nome"
            name="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={120}
            className={`campo ${estado.campos?.name ? "campo-erro" : ""}`}
            placeholder="Detergente neutro"
          />
        </Campo>

        <Campo
          id="preco"
          label="Preço"
          obrigatorio
          erro={estado.campos?.priceCents}
          ajuda="Digite só os números: 390 vira R$ 3,90"
        >
          <div className="relative">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 font-semibold text-slate-500">
              R$
            </span>
            <input
              id="preco"
              name="price"
              value={preco}
              onChange={(e) => setPreco(mascaraDinheiro(e.target.value))}
              inputMode="numeric"
              className={`campo pl-11 text-lg font-semibold ${estado.campos?.priceCents ? "campo-erro" : ""}`}
              placeholder="0,00"
            />
          </div>
        </Campo>

        <Campo
          id="tamanho"
          label="Tamanho ou quantidade"
          erro={estado.campos?.sizeLabel}
          ajuda="Ex: 1 L, 500 ml, pacote com 4"
        >
          <input
            id="tamanho"
            name="sizeLabel"
            value={tamanho}
            onChange={(e) => setTamanho(e.target.value)}
            maxLength={40}
            className="campo"
            placeholder="1 L"
          />
        </Campo>

        <Campo
          id="descricao"
          label="Descrição"
          erro={estado.campos?.description}
          ajuda="Uma frase curta ajuda o cliente a decidir."
        >
          <textarea
            id="descricao"
            name="description"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={500}
            className="campo min-h-20"
            placeholder="Corta a gordura sem ressecar as mãos."
          />
        </Campo>

        <Campo id="categoria" label="Categoria" erro={estado.campos?.categoryId}>
          <select
            id="categoria"
            name="categoryId"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="campo"
          >
            <option value="">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {categorias.length === 0 && (
            <p className="ajuda">
              Você ainda não tem categorias.{" "}
              <Link href="/admin/categorias" className="font-semibold text-marca-700 underline">
                Criar uma agora
              </Link>
            </p>
          )}
        </Campo>

        <div className="rounded-xl border border-slate-200 p-3">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>
              <span className="block font-semibold text-slate-800">
                Mostrar na loja
              </span>
              <span className="text-sm text-slate-500">
                {ativo
                  ? "O cliente consegue ver e pedir este produto."
                  : "Fica guardado só para você, sem aparecer na loja."}
              </span>
            </span>
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-6 w-6 shrink-0 accent-marca-600"
            />
          </label>
          <input type="hidden" name="active" value={ativo ? "1" : "0"} />
        </div>
      </section>

      {/* ---------------------------------------------- pré-visualização */}
      <section className="cartao p-4">
        <h2 className="mb-1 font-bold text-slate-900">Como vai aparecer para o cliente</h2>
        <p className="mb-3 text-sm text-slate-500">
          Este é o cartão que ele vê na loja.
        </p>

        <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-agua-50 text-2xl">🧴</div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="leading-snug font-semibold text-slate-900">
              {nome.trim() || "Nome do produto"}
            </h3>
            {tamanho.trim() && (
              <p className="text-xs font-medium text-agua-700">{tamanho}</p>
            )}
            {descricao.trim() && (
              <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{descricao}</p>
            )}
            <div className="mt-auto flex items-end justify-between gap-2 pt-2">
              <p className="text-lg font-bold text-slate-900">{formatBRL(centavos)}</p>
              <span className="btn-primario btn-sm">Adicionar</span>
            </div>
          </div>
        </div>

        {!ativo && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Atenção: com <strong>Mostrar na loja</strong> desligado, este produto{" "}
            <strong>não</strong> aparece para o cliente.
          </p>
        )}
      </section>

      <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
        <Link href="/admin/produtos" className="btn-secundario flex-1">
          Cancelar
        </Link>
        <BotaoSubmit className="btn-primario flex-[2]" ocupado="Salvando...">
          {produto ? "Salvar alterações" : "Cadastrar produto"}
        </BotaoSubmit>
      </div>
    </form>
  );
}
