"use client";

import { useActionState, useState } from "react";
import { FormAcao, BotaoSubmit } from "@/components/ui/FormAcao";
import { ESTADO_INICIAL } from "@/lib/estado-acao";
import type { Category } from "@/lib/types";
import {
  alternarCategoriaAtiva,
  excluirCategoria,
  moverCategoria,
  salvarCategoria,
} from "@/app/admin/(painel)/categorias/acoes";

type CategoriaComContagem = Category & { quantidadeProdutos: number };

type Props = { categorias: CategoriaComContagem[] };

export function ListaCategorias({ categorias }: Props) {
  const [editando, setEditando] = useState<string | null>(null);
  const [estadoNova, acaoNova] = useActionState(salvarCategoria, ESTADO_INICIAL);

  return (
    <div className="space-y-5">
      {/* ---------------------------------------------- nova categoria */}
      <form action={acaoNova} className="cartao space-y-3 p-4">
        <label htmlFor="nova-categoria" className="rotulo">
          Criar uma categoria
        </label>
        <div className="flex gap-2">
          <input
            id="nova-categoria"
            name="name"
            className={`campo ${estadoNova.campos?.name ? "campo-erro" : ""}`}
            placeholder="Ex: Cozinha, Banheiro, Roupas..."
            maxLength={60}
          />
          <BotaoSubmit className="btn-primario shrink-0" ocupado="Criando...">
            Criar
          </BotaoSubmit>
        </div>
        {estadoNova.campos?.name && (
          <p className="msg-erro" role="alert">
            {estadoNova.campos.name}
          </p>
        )}
        {estadoNova.erro && (
          <p className="msg-erro" role="alert">
            {estadoNova.erro}
          </p>
        )}
        <p className="ajuda">
          As categorias organizam a vitrine. O cliente usa elas para filtrar os produtos.
        </p>
      </form>

      {/* ---------------------------------------------- lista */}
      {categorias.length === 0 ? (
        <div className="cartao p-8 text-center">
          <p className="text-4xl">🏷️</p>
          <p className="mt-3 font-bold text-slate-800">Você ainda não tem categorias</p>
          <p className="mt-1 text-slate-600">
            Crie a primeira acima. Exemplo: <em>Cozinha</em>, <em>Banheiro</em>, <em>Roupas</em>.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {categorias.map((categoria, indice) => (
            <li key={categoria.id} className="cartao p-3">
              {editando === categoria.id ? (
                <FormularioEdicao
                  categoria={categoria}
                  aoCancelar={() => setEditando(null)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <FormAcao action={moverCategoria}>
                      <input type="hidden" name="id" value={categoria.id} />
                      <input type="hidden" name="direcao" value="cima" />
                      <BotaoSubmit
                        className="grid h-6 w-7 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                        aria-label={`Subir ${categoria.name}`}
                        ocupado="·"
                      >
                        ▲
                      </BotaoSubmit>
                    </FormAcao>
                    <FormAcao action={moverCategoria}>
                      <input type="hidden" name="id" value={categoria.id} />
                      <input type="hidden" name="direcao" value="baixo" />
                      <BotaoSubmit
                        className="grid h-6 w-7 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                        aria-label={`Descer ${categoria.name}`}
                        ocupado="·"
                      >
                        ▼
                      </BotaoSubmit>
                    </FormAcao>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {indice + 1}. {categoria.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {categoria.quantidadeProdutos === 0
                        ? "Nenhum produto"
                        : `${categoria.quantidadeProdutos} produto${categoria.quantidadeProdutos > 1 ? "s" : ""}`}
                      {!categoria.active && " · escondida da loja"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditando(categoria.id)}
                      className="btn-secundario btn-sm"
                    >
                      Renomear
                    </button>

                    <FormAcao action={alternarCategoriaAtiva}>
                      <input type="hidden" name="id" value={categoria.id} />
                      <input type="hidden" name="ativar" value={categoria.active ? "0" : "1"} />
                      <BotaoSubmit
                        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-lg hover:bg-slate-50"
                        aria-label={
                          categoria.active
                            ? `Esconder ${categoria.name} da loja`
                            : `Mostrar ${categoria.name} na loja`
                        }
                        title={categoria.active ? "Esconder da loja" : "Mostrar na loja"}
                        ocupado="·"
                      >
                        {categoria.active ? "👁️" : "🚫"}
                      </BotaoSubmit>
                    </FormAcao>

                    <FormAcao
                      action={excluirCategoria}
                      confirmar={
                        categoria.quantidadeProdutos > 0
                          ? `Excluir a categoria "${categoria.name}"?\n\nOs ${categoria.quantidadeProdutos} produtos dela NÃO serão apagados — eles ficam sem categoria e continuam na loja.`
                          : `Excluir a categoria "${categoria.name}"?`
                      }
                    >
                      <input type="hidden" name="id" value={categoria.id} />
                      <BotaoSubmit
                        className="grid h-9 w-9 place-items-center rounded-lg border border-red-200 bg-white text-lg text-red-600 hover:bg-red-50"
                        aria-label={`Excluir ${categoria.name}`}
                        title="Excluir"
                        ocupado="·"
                      >
                        🗑️
                      </BotaoSubmit>
                    </FormAcao>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FormularioEdicao({
  categoria,
  aoCancelar,
}: {
  categoria: Category;
  aoCancelar: () => void;
}) {
  const [estado, acao] = useActionState(salvarCategoria, ESTADO_INICIAL);

  return (
    <form action={acao} className="space-y-2">
      <input type="hidden" name="id" value={categoria.id} />
      <input type="hidden" name="active" value={String(categoria.active)} />
      <input
        name="name"
        defaultValue={categoria.name}
        autoFocus
        maxLength={60}
        className={`campo ${estado.campos?.name ? "campo-erro" : ""}`}
        aria-label="Nome da categoria"
      />
      {estado.campos?.name && (
        <p className="msg-erro" role="alert">
          {estado.campos.name}
        </p>
      )}
      <div className="flex gap-2">
        <BotaoSubmit className="btn-primario btn-sm flex-1">Salvar</BotaoSubmit>
        <button type="button" onClick={aoCancelar} className="btn-secundario btn-sm flex-1">
          Cancelar
        </button>
      </div>
    </form>
  );
}
