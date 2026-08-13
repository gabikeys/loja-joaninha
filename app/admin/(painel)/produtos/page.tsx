import Link from "next/link";
import { ListaProdutos } from "@/components/admin/ListaProdutos";
import { Aviso } from "@/components/ui/Aviso";
import { exigirAdmin } from "@/lib/admin";
import type { ProductWithCategory } from "@/lib/types";

export const metadata = { title: "Produtos — Painel" };

const MENSAGENS: Record<string, { tipo: "sucesso" | "erro"; texto: string }> = {
  criado: { tipo: "sucesso", texto: "Produto cadastrado! Ele já está na loja." },
  salvo: { tipo: "sucesso", texto: "Alterações salvas!" },
  excluido: { tipo: "sucesso", texto: "Produto excluído." },
  "erro-excluir": {
    tipo: "erro",
    texto: "Não conseguimos excluir esse produto. Tente de novo em instantes.",
  },
};

export default async function PaginaProdutos({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const { supabase } = await exigirAdmin();
  const { msg } = await searchParams;

  const { data, error } = await supabase
    .from("products")
    .select("*, categories ( id, name )")
    .order("position")
    .order("created_at");

  // Nunca dizer "você não tem produtos" por causa de uma falha de conexão:
  // isso assustaria ela à toa. Erro é erro, e tem tela própria.
  if (error) throw new Error(`Falha ao carregar produtos: ${error.message}`);

  const produtos = (data ?? []) as ProductWithCategory[];
  const aviso = msg ? MENSAGENS[msg] : undefined;

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meus produtos</h1>
          <p className="text-sm text-slate-500">
            {produtos.length === 0
              ? "Cadastre o que você vende."
              : `${produtos.length} cadastrado${produtos.length > 1 ? "s" : ""} · a ordem aqui é a ordem da loja`}
          </p>
        </div>
        <Link href="/admin/produtos/novo" className="btn-primario btn-sm shrink-0">
          + Novo
        </Link>
      </div>

      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}

      <ListaProdutos produtos={produtos} />
    </>
  );
}
