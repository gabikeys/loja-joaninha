import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioProduto } from "@/components/admin/FormularioProduto";
import { Aviso } from "@/components/ui/Aviso";
import { exigirAdmin } from "@/lib/admin";
import type { Category, Product } from "@/lib/types";

export const metadata = { title: "Editar produto — Painel" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
};

export default async function PaginaEditarProduto({ params, searchParams }: Props) {
  const { supabase } = await exigirAdmin();
  const { id } = await params;
  const { msg } = await searchParams;

  const [{ data: produto }, { data: categorias }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("position").order("created_at"),
  ]);

  if (!produto) notFound();

  return (
    <>
      <div className="mb-4">
        <Link href="/admin/produtos" className="text-sm text-slate-500 underline">
          ← Voltar para meus produtos
        </Link>
        <h1 className="mt-1 text-xl font-bold text-slate-900">Editar produto</h1>
      </div>

      {msg === "duplicado" && (
        <Aviso tipo="sucesso">
          Cópia criada! Ajuste o que precisar e ligue o <strong>Mostrar na loja</strong> para
          ela aparecer para o cliente.
        </Aviso>
      )}

      <FormularioProduto
        produto={produto as Product}
        categorias={(categorias ?? []) as Category[]}
      />
    </>
  );
}
