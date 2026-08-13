"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/admin";
import { enviarEmailStatusParaCliente } from "@/lib/email";
import { nextStatus } from "@/lib/format";
import type { Order, OrderStatus, StoreSettings } from "@/lib/types";

const STATUS_VALIDOS: OrderStatus[] = [
  "aguardando",
  "aceito",
  "em_preparo",
  "saiu_entrega",
  "entregue",
  "recusado",
  "cancelado",
];

/**
 * Muda o status de um pedido e avisa o cliente por e-mail (se ele deixou o
 * e-mail dele). O aviso é "melhor esforço": se o e-mail falhar, a mudança de
 * status continua valendo.
 */
export async function mudarStatusDoPedido(formData: FormData) {
  const { supabase } = await exigirAdmin();

  const id = String(formData.get("id") ?? "");
  const pedido = String(formData.get("status") ?? "") as OrderStatus | "proximo";

  const { data: atual } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!atual) return;

  const novoStatus =
    pedido === "proximo" ? nextStatus((atual as Order).status) : pedido;

  if (!novoStatus || !STATUS_VALIDOS.includes(novoStatus)) return;
  if (novoStatus === (atual as Order).status) return;

  const { data: atualizado, error } = await supabase
    .from("orders")
    .update({ status: novoStatus })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !atualizado) {
    console.error("[pedidos] Falha ao mudar o status:", error);
    return;
  }

  const { data: config } = await supabase.from("store_settings").select("*").eq("id", 1).single();

  await enviarEmailStatusParaCliente(atualizado as Order, config as StoreSettings);

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
}
