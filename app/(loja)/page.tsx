import { Vitrine, type ProdutoVitrine } from "@/components/loja/Vitrine";
import { getCategoriasAtivas, getProdutosDaVitrine, getStoreSettings } from "@/lib/data";
import { productImageUrl } from "@/lib/env";

export default async function PaginaVitrine() {
  let produtos, categorias, config;

  try {
    [produtos, categorias, config] = await Promise.all([
      getProdutosDaVitrine(),
      getCategoriasAtivas(),
      getStoreSettings(),
    ]);
  } catch (erro) {
    // Banco fora do ar. Tratado aqui, e não no error.tsx, para a mensagem já
    // vir pronta no HTML — sem depender do JavaScript carregar.
    console.error("[vitrine] Falha ao carregar a loja:", erro);
    return (
      <div className="cartao mt-6 p-8 text-center">
        <p className="text-4xl">😕</p>
        <h1 className="mt-3 text-lg font-bold text-slate-800">
          Não conseguimos carregar os produtos agora
        </h1>
        <p className="mt-1 text-slate-600">
          Pode ter sido a internet. Atualize a página em alguns segundos.
        </p>
      </div>
    );
  }

  const itens: ProdutoVitrine[] = produtos.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    size_label: p.size_label,
    price_cents: p.price_cents,
    image_path: p.image_path,
    imageUrl: productImageUrl(p.image_path),
    category_id: p.category_id,
    category_name: p.categories?.name ?? null,
  }));

  // Só mostra as categorias que realmente têm produto na vitrine.
  const comProduto = new Set(itens.map((i) => i.category_id));
  const categoriasVisiveis = categorias
    .filter((c) => comProduto.has(c.id))
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">Nossos produtos</h1>
        <p className="text-sm text-slate-500">
          Escolha, monte seu pedido e receba em casa. Entrega: {config.delivery_info}
        </p>
      </div>

      <Vitrine produtos={itens} categorias={categoriasVisiveis} />
    </>
  );
}
