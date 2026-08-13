import Link from "next/link";
import { AtualizarAutomatico } from "@/components/ui/AtualizarAutomatico";
import { EtiquetaStatus } from "@/components/ui/EtiquetaStatus";
import { exigirAdmin } from "@/lib/admin";
import { formatBRL, formatDateTime } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

export const metadata = { title: "Pedidos — Painel" };

const FILTROS = {
  novos: { rotulo: "Novos", status: ["aguardando"] as OrderStatus[] },
  andamento: {
    rotulo: "Em andamento",
    status: ["aceito", "em_preparo", "saiu_entrega"] as OrderStatus[],
  },
  finalizados: {
    rotulo: "Finalizados",
    status: ["entregue", "recusado", "cancelado"] as OrderStatus[],
  },
  todos: { rotulo: "Todos", status: [] as OrderStatus[] },
};

type ChaveFiltro = keyof typeof FILTROS;

type PedidoDaLista = Order & { order_items: { quantity: number }[] };

export default async function PaginaPedidos({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { supabase } = await exigirAdmin();
  const { filtro } = await searchParams;

  const chave: ChaveFiltro = filtro && filtro in FILTROS ? (filtro as ChaveFiltro) : "novos";
  const selecionado = FILTROS[chave];

  let consulta = supabase
    .from("orders")
    .select("*, order_items ( quantity )")
    .order("created_at", { ascending: false })
    .limit(100);

  if (selecionado.status.length > 0) {
    consulta = consulta.in("status", selecionado.status);
  }

  const { data, error } = await consulta;

  // "Nenhum pedido" precisa significar nenhum pedido, e não "deu erro".
  if (error) throw new Error(`Falha ao carregar pedidos: ${error.message}`);

  const pedidos = (data ?? []) as PedidoDaLista[];

  return (
    <>
      <AtualizarAutomatico segundos={60} />

      <h1 className="mb-3 text-xl font-bold text-slate-900">Pedidos</h1>

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {(Object.keys(FILTROS) as ChaveFiltro[]).map((k) => (
          <Link
            key={k}
            href={`/admin/pedidos?filtro=${k}`}
            aria-current={k === chave ? "page" : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
              k === chave
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            {FILTROS[k].rotulo}
          </Link>
        ))}
      </div>

      {pedidos.length === 0 ? (
        <div className="cartao p-8 text-center">
          <p className="text-4xl">{chave === "novos" ? "☕" : "📭"}</p>
          <p className="mt-3 font-bold text-slate-800">
            {chave === "novos" ? "Nenhum pedido novo agora" : "Nada por aqui"}
          </p>
          <p className="mt-1 text-slate-600">
            {chave === "novos"
              ? "Quando chegar um pedido, ele aparece aqui e você recebe um e-mail."
              : "Experimente outro filtro acima."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {pedidos.map((pedido) => {
            const quantidade = pedido.order_items.reduce((s, i) => s + i.quantity, 0);

            return (
              <li key={pedido.id}>
                <Link
                  href={`/admin/pedidos/${pedido.id}`}
                  className={`cartao block p-4 ${
                    pedido.status === "aguardando" ? "border-marca-300 bg-marca-50/40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">
                        #{pedido.number} · {pedido.customer_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatDateTime(pedido.created_at)}
                      </p>
                    </div>
                    <EtiquetaStatus status={pedido.status} />
                  </div>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="min-w-0 truncate text-sm text-slate-600">
                      {quantidade} {quantidade === 1 ? "item" : "itens"} ·{" "}
                      {pedido.addr_district}, {pedido.addr_city}
                    </p>
                    <p className="shrink-0 font-bold text-slate-900">
                      {formatBRL(pedido.total_cents)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
