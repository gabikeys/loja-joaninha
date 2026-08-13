import "server-only";
import { Resend } from "resend";
import { siteUrl } from "@/lib/env";
import {
  PAYMENT_LABEL,
  STATUS_LABEL,
  STATUS_MESSAGE,
  formatAddress,
  formatBRL,
  formatDateTime,
  formatPhone,
} from "@/lib/format";
import type { Order, OrderItem, StoreSettings } from "@/lib/types";

/**
 * Envio de e-mail. Tudo aqui é "melhor esforço": se o Resend estiver fora do ar
 * ou sem chave, o PEDIDO NÃO PODE SE PERDER. Por isso nada aqui lança erro
 * para cima — apenas registra no log do servidor.
 */

function getResend(): Resend | null {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    console.warn("[email] RESEND_API_KEY não configurada — e-mail não enviado.");
    return null;
  }
  return new Resend(chave);
}

function remetente(config: StoreSettings): string {
  return process.env.EMAIL_FROM || `${config.store_name} <onboarding@resend.dev>`;
}

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const ESTILO = {
  corpo:
    "margin:0;padding:24px 12px;background:#fbf7f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1e293b;",
  cartao:
    "max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;",
  cabecalho: "background:#e11d48;color:#ffffff;padding:20px 24px;",
  secao: "padding:20px 24px;border-top:1px solid #f1f5f9;",
  titulo:
    "margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;",
  botao:
    "display:inline-block;background:#e11d48;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:700;",
};

function tabelaItens(itens: OrderItem[], total: number): string {
  const linhas = itens
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
            <strong>${i.quantity}x</strong> ${escapar(i.product_name)}
            <br><span style="color:#64748b;font-size:13px;">${formatBRL(i.unit_price_cents)} cada</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;white-space:nowrap;">
            ${formatBRL(i.line_total_cents)}
          </td>
        </tr>`
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px;">
      ${linhas}
      <tr>
        <td style="padding:12px 0;font-weight:700;font-size:17px;">Total</td>
        <td style="padding:12px 0;text-align:right;font-weight:700;font-size:17px;">${formatBRL(total)}</td>
      </tr>
    </table>`;
}

/** Para onde vai o aviso de pedido novo: painel primeiro, .env como reserva. */
function destinatarioAdmin(config: StoreSettings): string | null {
  return config.admin_email?.trim() || process.env.EMAIL_TO_ADMIN?.trim() || null;
}

// ---------------------------------------------------------------------------
// 1. Pedido novo → e-mail para a Joaninha
// ---------------------------------------------------------------------------
export async function enviarEmailPedidoNovo(
  pedido: Order,
  itens: OrderItem[],
  config: StoreSettings
): Promise<void> {
  const resend = getResend();
  const para = destinatarioAdmin(config);

  if (!resend) return;
  if (!para) {
    console.warn(
      "[email] Nenhum e-mail de destino. Preencha em Configurações no painel ou EMAIL_TO_ADMIN."
    );
    return;
  }

  const link = `${siteUrl()}/admin/pedidos/${pedido.id}`;
  const endereco = escapar(formatAddress(pedido)).replace(/\n/g, "<br>");
  const troco =
    pedido.payment_method === "dinheiro" && pedido.change_for_cents
      ? `<br><strong>Levar troco para ${formatBRL(pedido.change_for_cents)}</strong>`
      : "";

  const html = `
  <div style="${ESTILO.corpo}">
    <div style="${ESTILO.cartao}">
      <div style="${ESTILO.cabecalho}">
        <p style="margin:0;font-size:14px;opacity:.9;">Pedido novo 🎉</p>
        <h1 style="margin:4px 0 0;font-size:24px;">Pedido #${pedido.number}</h1>
        <p style="margin:4px 0 0;font-size:14px;opacity:.9;">${formatDateTime(pedido.created_at)} · código ${pedido.code}</p>
      </div>

      <div style="${ESTILO.secao}">
        <p style="${ESTILO.titulo}">Itens</p>
        ${tabelaItens(itens, pedido.total_cents)}
      </div>

      <div style="${ESTILO.secao}">
        <p style="${ESTILO.titulo}">Pagamento</p>
        <p style="margin:0;font-size:16px;">${PAYMENT_LABEL[pedido.payment_method]}${troco}</p>
      </div>

      <div style="${ESTILO.secao}">
        <p style="${ESTILO.titulo}">Cliente</p>
        <p style="margin:0;font-size:16px;">
          <strong>${escapar(pedido.customer_name)}</strong><br>
          WhatsApp: ${formatPhone(pedido.customer_phone)}
          ${pedido.customer_email ? `<br>E-mail: ${escapar(pedido.customer_email)}` : ""}
        </p>
      </div>

      <div style="${ESTILO.secao};background:#fff1f2;">
        <p style="${ESTILO.titulo};color:#9f1239;">Endereço de entrega</p>
        <p style="margin:0;font-size:17px;line-height:1.5;font-weight:600;">${endereco}</p>
      </div>

      ${
        pedido.notes
          ? `<div style="${ESTILO.secao}">
               <p style="${ESTILO.titulo}">Observações do cliente</p>
               <p style="margin:0;font-size:16px;">${escapar(pedido.notes)}</p>
             </div>`
          : ""
      }

      <div style="${ESTILO.secao};text-align:center;">
        <a href="${link}" style="${ESTILO.botao}">Abrir pedido no painel</a>
        <p style="margin:12px 0 0;font-size:13px;color:#64748b;">
          Lá você aceita, recusa e avança o pedido.
        </p>
      </div>
    </div>
  </div>`;

  const texto = [
    `PEDIDO NOVO #${pedido.number} (${pedido.code})`,
    formatDateTime(pedido.created_at),
    "",
    ...itens.map((i) => `${i.quantity}x ${i.product_name} — ${formatBRL(i.line_total_cents)}`),
    `TOTAL: ${formatBRL(pedido.total_cents)}`,
    "",
    `Pagamento: ${PAYMENT_LABEL[pedido.payment_method]}`,
    pedido.change_for_cents ? `Troco para: ${formatBRL(pedido.change_for_cents)}` : "",
    "",
    `Cliente: ${pedido.customer_name} — ${formatPhone(pedido.customer_phone)}`,
    "",
    "ENDEREÇO DE ENTREGA:",
    formatAddress(pedido),
    "",
    pedido.notes ? `Observações: ${pedido.notes}` : "",
    "",
    `Abrir no painel: ${link}`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  try {
    const { error } = await resend.emails.send({
      from: remetente(config),
      to: para,
      replyTo: pedido.customer_email ?? undefined,
      subject: `🐞 Pedido novo #${pedido.number} — ${pedido.customer_name} — ${formatBRL(pedido.total_cents)}`,
      html,
      text: texto,
    });
    if (error) console.error("[email] Falha ao avisar do pedido novo:", error);
  } catch (e) {
    console.error("[email] Erro inesperado ao avisar do pedido novo:", e);
  }
}

// ---------------------------------------------------------------------------
// 2. Status mudou → e-mail para o cliente (só se ele informou e-mail)
// ---------------------------------------------------------------------------
export async function enviarEmailStatusParaCliente(
  pedido: Order,
  config: StoreSettings
): Promise<void> {
  if (!pedido.customer_email) return;

  const resend = getResend();
  if (!resend) return;

  const link = `${siteUrl()}/pedido/${pedido.code}`;
  const primeiroNome = pedido.customer_name.split(" ")[0];

  const html = `
  <div style="${ESTILO.corpo}">
    <div style="${ESTILO.cartao}">
      <div style="${ESTILO.cabecalho}">
        <p style="margin:0;font-size:14px;opacity:.9;">${escapar(config.store_name)}</p>
        <h1 style="margin:4px 0 0;font-size:22px;">Pedido #${pedido.number}: ${STATUS_LABEL[pedido.status]}</h1>
      </div>

      <div style="${ESTILO.secao}">
        <p style="margin:0 0 12px;font-size:16px;">Oi, ${escapar(primeiroNome)}!</p>
        <p style="margin:0;font-size:16px;line-height:1.5;">${STATUS_MESSAGE[pedido.status]}</p>
      </div>

      <div style="${ESTILO.secao}">
        <p style="${ESTILO.titulo}">Resumo</p>
        <p style="margin:0;font-size:16px;">
          Total: <strong>${formatBRL(pedido.total_cents)}</strong><br>
          Pagamento: ${PAYMENT_LABEL[pedido.payment_method]}<br>
          Código do pedido: <strong>${pedido.code}</strong>
        </p>
      </div>

      <div style="${ESTILO.secao};text-align:center;">
        <a href="${link}" style="${ESTILO.botao}">Acompanhar meu pedido</a>
      </div>
    </div>
  </div>`;

  try {
    const { error } = await resend.emails.send({
      from: remetente(config),
      to: pedido.customer_email,
      subject: `Pedido #${pedido.number}: ${STATUS_LABEL[pedido.status]}`,
      html,
      text: `${STATUS_MESSAGE[pedido.status]}\n\nPedido #${pedido.number} (${pedido.code})\nTotal: ${formatBRL(
        pedido.total_cents
      )}\n\nAcompanhe em: ${link}`,
    });
    if (error) console.error("[email] Falha ao avisar o cliente:", error);
  } catch (e) {
    console.error("[email] Erro inesperado ao avisar o cliente:", e);
  }
}
