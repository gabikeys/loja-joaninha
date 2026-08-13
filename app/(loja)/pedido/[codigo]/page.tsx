import Link from "next/link";
import { notFound } from "next/navigation";
import { AtualizarAutomatico } from "@/components/ui/AtualizarAutomatico";
import { LinhaDoTempo } from "@/components/loja/LinhaDoTempo";
import { BotaoCopiar } from "@/components/ui/BotaoCopiar";
import { getStoreSettings } from "@/lib/data";
import { buscarPedidoPorCodigo } from "@/lib/pedidos";
import {
  PAYMENT_LABEL,
  STATUS_LABEL,
  STATUS_MESSAGE,
  formatAddress,
  formatBRL,
  formatDateTime,
  isFinalStatus,
  whatsappLink,
} from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ novo?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { codigo } = await params;
  return { title: `Pedido ${codigo.toUpperCase()} — Loja da Joaninha` };
}

export default async function PaginaAcompanhamento({ params, searchParams }: Props) {
  const { codigo } = await params;
  const { novo } = await searchParams;

  const dados = await buscarPedidoPorCodigo(codigo);
  if (!dados) notFound();

  const { pedido, itens, historico } = dados;
  const config = await getStoreSettings();
  const finalizado = isFinalStatus(pedido.status);

  return (
    <div className="space-y-4">
      {!finalizado && <AtualizarAutomatico />}

      {novo === "1" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-3xl">🎉</p>
          <h1 className="mt-1 text-lg font-bold text-emerald-900">Pedido enviado!</h1>
          <p className="mt-1 text-sm text-emerald-800">
            A {config.store_name.replace(/^Loja da /i, "")} já foi avisada e vai confirmar em
            instantes.
          </p>
        </div>
      )}

      {/* código para guardar */}
      <section className="cartao p-4 text-center">
        <p className="text-sm text-slate-500">Guarde o código do seu pedido</p>
        <p className="my-1 text-3xl font-bold tracking-wider text-marca-700">{pedido.code}</p>
        <p className="text-sm text-slate-500">
          Pedido #{pedido.number} · {formatDateTime(pedido.created_at)}
        </p>
        <div className="mt-3 flex justify-center gap-2">
          <BotaoCopiar texto={pedido.code} rotulo="Copiar código" />
          {config.whatsapp.trim() && (
            <a
              href={whatsappLink(
                config.whatsapp,
                `Olá! Quero falar sobre meu pedido ${pedido.code}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secundario btn-sm"
            >
              Falar com a loja
            </a>
          )}
        </div>
      </section>

      {/* status */}
      <section className="cartao p-4">
        <h2 className="text-lg font-bold text-slate-900">{STATUS_LABEL[pedido.status]}</h2>
        <p className="mt-0.5 mb-4 text-slate-600">{STATUS_MESSAGE[pedido.status]}</p>
        <LinhaDoTempo statusAtual={pedido.status} historico={historico} />
        {!finalizado && (
          <p className="mt-4 text-center text-xs text-slate-400">
            Esta página se atualiza sozinha.
          </p>
        )}
      </section>

      {/* itens */}
      <section className="cartao p-4">
        <h2 className="mb-2 font-bold text-slate-900">Itens do pedido</h2>
        <ul className="space-y-2">
          {itens.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 text-slate-700">
              <span>
                <strong>{item.quantity}x</strong> {item.product_name}
              </span>
              <span className="whitespace-nowrap">{formatBRL(item.line_total_cents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-slate-200 pt-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Entrega</span>
            <span className="text-right">{config.delivery_info}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-900">
            <span>Total</span>
            <span>{formatBRL(pedido.total_cents)}</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Pagamento: <strong>{PAYMENT_LABEL[pedido.payment_method]}</strong>
          {pedido.change_for_cents
            ? ` (troco para ${formatBRL(pedido.change_for_cents)})`
            : ""}
        </p>
      </section>

      {/* entrega */}
      <section className="cartao p-4">
        <h2 className="mb-1 font-bold text-slate-900">Entregar em</h2>
        <p className="whitespace-pre-line text-slate-700">{formatAddress(pedido)}</p>
        <p className="mt-2 text-sm text-slate-500">Em nome de {pedido.customer_name}</p>
        {pedido.notes && (
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <strong>Observações:</strong> {pedido.notes}
          </p>
        )}
      </section>

      <Link href="/" className="btn-secundario w-full">
        Voltar para a loja
      </Link>
    </div>
  );
}
