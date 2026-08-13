import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { enviarEmailPedidoNovo } from "@/lib/email";
import { errosPorCampo, novoPedidoSchema } from "@/lib/validation";
import type { Order, OrderItem, StoreSettings } from "@/lib/types";

/**
 * Cria um pedido.
 *
 * Ponto importante de segurança: o preço NUNCA vem do navegador. O que chega
 * aqui é só "id do produto + quantidade"; o valor é lido do banco na hora.
 * Assim ninguém consegue forjar um pedido de R$ 0,01.
 */
export async function POST(request: Request) {
  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Não entendi os dados enviados." }, { status: 400 });
  }

  const analise = novoPedidoSchema.safeParse(corpo);
  if (!analise.success) {
    return NextResponse.json(
      { erro: "Confira os campos destacados.", campos: errosPorCampo(analise.error) },
      { status: 400 }
    );
  }
  const dados = analise.data;

  // Se o mesmo produto vier repetido, soma as quantidades.
  const quantidades = new Map<string, number>();
  for (const item of dados.items) {
    quantidades.set(item.productId, Math.min(99, (quantidades.get(item.productId) ?? 0) + item.quantity));
  }

  const supabase = createSupabaseAdminClient();

  const { data: produtos, error: erroProdutos } = await supabase
    .from("products")
    .select("id, name, price_cents, active")
    .in("id", [...quantidades.keys()]);

  if (erroProdutos) {
    console.error("[pedido] Falha ao buscar produtos:", erroProdutos);
    return NextResponse.json(
      { erro: "Não conseguimos confirmar os produtos agora. Tente de novo em instantes." },
      { status: 500 }
    );
  }

  const disponiveis = (produtos ?? []).filter((p) => p.active);
  if (disponiveis.length !== quantidades.size) {
    const indisponiveis = [...quantidades.keys()].filter(
      (id) => !disponiveis.some((p) => p.id === id)
    );
    const nomes = (produtos ?? [])
      .filter((p) => indisponiveis.includes(p.id))
      .map((p) => p.name);

    return NextResponse.json(
      {
        erro:
          nomes.length > 0
            ? `Estes produtos não estão mais disponíveis: ${nomes.join(", ")}. Remova do carrinho para continuar.`
            : "Alguns produtos do seu carrinho saíram do ar. Volte à vitrine e monte o pedido de novo.",
        indisponiveis,
      },
      { status: 409 }
    );
  }

  const itens = disponiveis.map((p) => {
    const quantidade = quantidades.get(p.id)!;
    return {
      product_id: p.id,
      product_name: p.name,
      unit_price_cents: p.price_cents,
      quantity: quantidade,
      line_total_cents: p.price_cents * quantidade,
    };
  });

  const total = itens.reduce((s, i) => s + i.line_total_cents, 0);

  const { data: pedido, error: erroPedido } = await supabase
    .from("orders")
    .insert({
      status: "aguardando",
      customer_name: dados.customerName,
      customer_phone: dados.customerPhone,
      customer_email: dados.customerEmail,
      addr_street: dados.addrStreet,
      addr_number: dados.addrNumber,
      addr_complement: dados.addrComplement,
      addr_district: dados.addrDistrict,
      addr_city: dados.addrCity,
      addr_reference: dados.addrReference,
      addr_zip: dados.addrZip,
      payment_method: dados.paymentMethod,
      change_for_cents: dados.paymentMethod === "dinheiro" ? dados.changeForCents : null,
      notes: dados.notes,
      total_cents: total,
    })
    .select("*")
    .single();

  if (erroPedido || !pedido) {
    console.error("[pedido] Falha ao gravar o pedido:", erroPedido);
    return NextResponse.json(
      { erro: "Não conseguimos registrar seu pedido. Tente novamente." },
      { status: 500 }
    );
  }

  const { data: itensGravados, error: erroItens } = await supabase
    .from("order_items")
    .insert(itens.map((i) => ({ ...i, order_id: pedido.id })))
    .select("*");

  if (erroItens) {
    // Pedido sem itens não serve para nada: desfaz para não confundir a Joaninha.
    console.error("[pedido] Falha ao gravar os itens, desfazendo o pedido:", erroItens);
    await supabase.from("orders").delete().eq("id", pedido.id);
    return NextResponse.json(
      { erro: "Não conseguimos registrar seu pedido. Tente novamente." },
      { status: 500 }
    );
  }

  const { data: config } = await supabase.from("store_settings").select("*").eq("id", 1).single();

  // O e-mail é importante, mas o pedido já está salvo: se falhar, o pedido
  // continua valendo e aparece no painel do mesmo jeito.
  await enviarEmailPedidoNovo(
    pedido as Order,
    (itensGravados ?? []) as OrderItem[],
    config as StoreSettings
  );

  return NextResponse.json(
    { id: pedido.id, code: pedido.code, number: pedido.number },
    { status: 201 }
  );
}
