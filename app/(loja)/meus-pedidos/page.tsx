import Link from "next/link";
import { redirect } from "next/navigation";
import { EtiquetaStatus } from "@/components/ui/EtiquetaStatus";
import { getClienteLogado } from "@/lib/conta";
import { formatBRL, formatDateTime } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";

export const metadata = { title: "Meus pedidos — Loja da Joaninha" };

type PedidoDaLista = Order & { order_items: { quantity: number; product_name: string }[] };

export default async function PaginaMeusPedidos() {
  const cliente = await getClienteLogado();
  if (!cliente) redirect("/entrar?proximo=/meus-pedidos");

  // Sem filtro por usuário na consulta: quem filtra é o RLS do banco, que só
  // deixa passar as linhas com user_id igual ao do cliente logado.
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items ( quantity, product_name )")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(`Falha ao carregar seus pedidos: ${error.message}`);

  const pedidos = (data ?? []) as PedidoDaLista[];

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4">
        <Link href="/minha-conta" className="text-sm text-slate-500 underline">
          ← Minha conta
        </Link>
        <h1 className="mt-1 text-xl font-bold text-slate-900">Meus pedidos</h1>
      </div>

      {pedidos.length === 0 ? (
        <div className="cartao p-8 text-center">
          <p className="text-4xl">📦</p>
          <p className="mt-3 font-bold text-slate-800">Você ainda não fez pedidos</p>
          <p className="mt-1 text-slate-600">
            Quando fizer um pedido logado na sua conta, ele aparece aqui.
          </p>
          <Link href="/" className="btn-primario mt-5 w-full">
            Ver produtos
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {pedidos.map((pedido) => {
            const itens = pedido.order_items.reduce((s, i) => s + i.quantity, 0);
            const resumo = pedido.order_items
              .map((i) => `${i.quantity}x ${i.product_name}`)
              .join(", ");

            return (
              <li key={pedido.id}>
                <Link href={`/pedido/${pedido.code}`} className="cartao block p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">Pedido #{pedido.number}</p>
                      <p className="text-sm text-slate-500">
                        {formatDateTime(pedido.created_at)}
                      </p>
                    </div>
                    <EtiquetaStatus status={pedido.status} />
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{resumo}</p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {itens} {itens === 1 ? "item" : "itens"}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatBRL(pedido.total_cents)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-5 text-center text-sm text-slate-500">
        Fez um pedido sem estar logado? Ele não aparece aqui —{" "}
        <Link href="/acompanhar" className="underline">
          busque pelo código
        </Link>
        .
      </p>
    </div>
  );
}
