import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem, OrderStatusHistory } from "@/lib/types";

export type PedidoCompleto = {
  pedido: Order;
  itens: OrderItem[];
  historico: OrderStatusHistory[];
};

/**
 * Busca um pedido pelo código público (JN-XXXXXX).
 * Usado na tela de acompanhamento: o cliente não tem login, então quem lê o
 * banco é o servidor — e só devolve para a página o pedido daquele código.
 */
export async function buscarPedidoPorCodigo(codigo: string): Promise<PedidoCompleto | null> {
  const normalizado = codigo.trim().toUpperCase();
  if (!/^JN-[A-Z0-9]{6}$/.test(normalizado)) return null;

  const supabase = createSupabaseAdminClient();

  const { data: pedido } = await supabase
    .from("orders")
    .select("*")
    .eq("code", normalizado)
    .maybeSingle();

  if (!pedido) return null;

  const [{ data: itens }, { data: historico }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", pedido.id).order("product_name"),
    supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", pedido.id)
      .order("created_at"),
  ]);

  return {
    pedido: pedido as Order,
    itens: (itens ?? []) as OrderItem[],
    historico: (historico ?? []) as OrderStatusHistory[],
  };
}
