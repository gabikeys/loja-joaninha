import Link from "next/link";
import { FormularioProduto } from "@/components/admin/FormularioProduto";
import { exigirAdmin } from "@/lib/admin";
import type { Category } from "@/lib/types";

export const metadata = { title: "Novo produto — Painel" };

export default async function PaginaNovoProduto() {
  const { supabase } = await exigirAdmin();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("position")
    .order("created_at");

  return (
    <>
      <div className="mb-4">
        <Link href="/admin/produtos" className="text-sm text-slate-500 underline">
          ← Voltar para meus produtos
        </Link>
        <h1 className="mt-1 text-xl font-bold text-slate-900">Novo produto</h1>
      </div>

      <FormularioProduto categorias={(data ?? []) as Category[]} />
    </>
  );
}
