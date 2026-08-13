import Link from "next/link";
import { notFound } from "next/navigation";
import { EtiquetaStatus } from "@/components/ui/EtiquetaStatus";
import { BotaoCopiar } from "@/components/ui/BotaoCopiar";
import { FormAcao, BotaoSubmit } from "@/components/ui/FormAcao";
import { exigirAdmin } from "@/lib/admin";
import {
  PAYMENT_LABEL,
  STATUS_LABEL,
  formatAddress,
  formatBRL,
  formatDateTime,
  formatPhone,
  isFinalStatus,
  nextStatus,
  whatsappLink,
} from "@/lib/format";
import type { Order, OrderItem, OrderStatusHistory } from "@/lib/types";
import { mudarStatusDoPedido } from "../acoes";

export const metadata = { title: "Pedido — Painel" };

export default async function PaginaPedido({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await exigirAdmin();
  const { id } = await params;

  const { data: pedido } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!pedido) notFound();

  const p = pedido as Order;

  const [{ data: itens }, { data: historico }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", id).order("product_name"),
    supabase.from("order_status_history").select("*").eq("order_id", id).order("created_at"),
  ]);

  const listaItens = (itens ?? []) as OrderItem[];
  const listaHistorico = (historico ?? []) as OrderStatusHistory[];

  const endereco = formatAddress(p);
  const enderecoUmaLinha = endereco.replace(/\n/g, ", ");
  const proximo = nextStatus(p.status);
  const finalizado = isFinalStatus(p.status);

  const mensagemWhats =
    `Olá, ${p.customer_name.split(" ")[0]}! Aqui é da loja. ` +
    `Sobre o seu pedido #${p.number}:`;

  return (
    <div className="space-y-4 pb-4">
      <div>
        <Link href="/admin/pedidos" className="text-sm text-slate-500 underline">
          ← Voltar para os pedidos
        </Link>
        <div className="mt-1 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pedido #{p.number}</h1>
            <p className="text-sm text-slate-500">
              {formatDateTime(p.created_at)} · código {p.code}
            </p>
          </div>
          <EtiquetaStatus status={p.status} />
        </div>
      </div>

      {/* ------------------------------------------------ endereço em destaque */}
      <section className="rounded-2xl border-2 border-marca-200 bg-marca-50 p-4">
        <h2 className="text-xs font-bold tracking-wide text-marca-800 uppercase">
          Endereço de entrega
        </h2>
        <p className="mt-1.5 text-lg leading-relaxed font-semibold whitespace-pre-line text-slate-900">
          {endereco}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <BotaoCopiar texto={enderecoUmaLinha} rotulo="Copiar endereço" />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoUmaLinha)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secundario btn-sm"
          >
            Abrir no mapa
          </a>
        </div>
      </section>

      {/* ------------------------------------------------ cliente */}
      <section className="cartao p-4">
        <h2 className="mb-2 font-bold text-slate-900">Cliente</h2>
        <p className="text-lg font-semibold text-slate-900">{p.customer_name}</p>
        <p className="text-slate-600">{formatPhone(p.customer_phone)}</p>
        {p.customer_email && <p className="text-slate-600">{p.customer_email}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={whatsappLink(p.customer_phone, mensagemWhats)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primario btn-sm"
          >
            Chamar no WhatsApp
          </a>
          <a href={`tel:${p.customer_phone}`} className="btn-secundario btn-sm">
            Ligar
          </a>
          <BotaoCopiar texto={formatPhone(p.customer_phone)} rotulo="Copiar telefone" />
        </div>
      </section>

      {/* ------------------------------------------------ itens */}
      <section className="cartao p-4">
        <h2 className="mb-2 font-bold text-slate-900">Itens do pedido</h2>
        <ul className="divide-y divide-slate-100">
          {listaItens.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-2">
              <span className="text-slate-700">
                <strong className="text-slate-900">{item.quantity}x</strong> {item.product_name}
                <span className="block text-xs text-slate-500">
                  {formatBRL(item.unit_price_cents)} cada
                </span>
              </span>
              <span className="font-semibold whitespace-nowrap text-slate-900">
                {formatBRL(item.line_total_cents)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-900">
          <span>Total</span>
          <span>{formatBRL(p.total_cents)}</span>
        </div>

        <div className="mt-3 rounded-xl bg-slate-50 p-3">
          <p className="font-semibold text-slate-800">{PAYMENT_LABEL[p.payment_method]}</p>
          {p.payment_method === "dinheiro" && (
            <p className="text-sm text-slate-600">
              {p.change_for_cents
                ? `Levar troco para ${formatBRL(p.change_for_cents)} (troco de ${formatBRL(
                    Math.max(0, p.change_for_cents - p.total_cents)
                  )})`
                : "Cliente disse que tem o valor certo."}
            </p>
          )}
        </div>

        {p.notes && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-bold text-amber-800 uppercase">Observações do cliente</p>
            <p className="mt-1 text-slate-800">{p.notes}</p>
          </div>
        )}
      </section>

      {/* ------------------------------------------------ histórico */}
      <section className="cartao p-4">
        <h2 className="mb-2 font-bold text-slate-900">Histórico</h2>
        <ul className="space-y-1 text-sm">
          {listaHistorico.map((h) => (
            <li key={h.id} className="flex justify-between gap-3 text-slate-600">
              <span>{STATUS_LABEL[h.to_status]}</span>
              <span className="whitespace-nowrap text-slate-400">
                {formatDateTime(h.created_at)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------ ações */}
      {!finalizado && (
        <div className="sticky bottom-0 -mx-4 space-y-2 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
          {p.status === "aguardando" ? (
            <>
              <FormAcao action={mudarStatusDoPedido}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="status" value="aceito" />
                <BotaoSubmit className="btn-primario w-full" ocupado="Aceitando...">
                  Aceitar pedido
                </BotaoSubmit>
              </FormAcao>

              <FormAcao
                action={mudarStatusDoPedido}
                confirmar={`Recusar o pedido #${p.number}?\n\nO cliente vai ver que não foi possível atender.`}
              >
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="status" value="recusado" />
                <BotaoSubmit className="btn-perigo w-full" ocupado="Recusando...">
                  Recusar pedido
                </BotaoSubmit>
              </FormAcao>
            </>
          ) : (
            <>
              {proximo && (
                <FormAcao action={mudarStatusDoPedido}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value={proximo} />
                  <BotaoSubmit className="btn-primario w-full" ocupado="Atualizando...">
                    Avançar para: {STATUS_LABEL[proximo]}
                  </BotaoSubmit>
                </FormAcao>
              )}

              <FormAcao
                action={mudarStatusDoPedido}
                confirmar={`Cancelar o pedido #${p.number}?`}
              >
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="status" value="cancelado" />
                <BotaoSubmit className="btn-secundario w-full" ocupado="Cancelando...">
                  Cancelar pedido
                </BotaoSubmit>
              </FormAcao>
            </>
          )}

          {p.customer_email && (
            <p className="text-center text-xs text-slate-500">
              O cliente recebe um e-mail a cada mudança.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
