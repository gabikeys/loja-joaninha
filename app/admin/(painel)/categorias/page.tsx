import { ListaCategorias } from "@/components/admin/ListaCategorias";
import { Aviso } from "@/components/ui/Aviso";
import { exigirAdmin } from "@/lib/admin";
import type { Category } from "@/lib/types";

export const metadata = { title: "Categorias — Painel" };

const MENSAGENS: Record<string, string> = {
  criada: "Categoria criada!",
  salva: "Categoria salva!",
  excluida: "Categoria excluída.",
};

export default async function PaginaCategorias({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const { supabase } = await exigirAdmin();
  const { msg } = await searchParams;

  const [{ data: categorias, error }, { data: produtos }] = await Promise.all([
    supabase.from("categories").select("*").order("position").order("created_at"),
    supabase.from("products").select("category_id"),
  ]);

  if (error) throw new Error(`Falha ao carregar categorias: ${error.message}`);

  const contagem = new Map<string, number>();
  for (const p of produtos ?? []) {
    if (p.category_id) contagem.set(p.category_id, (contagem.get(p.category_id) ?? 0) + 1);
  }

  const lista = ((categorias ?? []) as Category[]).map((c) => ({
    ...c,
    quantidadeProdutos: contagem.get(c.id) ?? 0,
  }));

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">Categorias</h1>
        <p className="text-sm text-slate-500">
          Servem para separar seus produtos na loja. Você pode criar quantas quiser.
        </p>
      </div>

      {msg && MENSAGENS[msg] && <Aviso tipo="sucesso">{MENSAGENS[msg]}</Aviso>}

      <ListaCategorias categorias={lista} />
    </>
  );
}
