import type { Order, OrderStatus, PaymentMethod } from "./types";

/** 1290 -> "R$ 12,90" */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Aceita o que a Joaninha digitar ("12,90", "R$ 12,90", "12.90", "12") e
 * devolve centavos. Retorna null se não der para entender.
 */
export function parseBRLToCents(input: string): number | null {
  const limpo = input.replace(/[^\d,.-]/g, "").trim();
  if (!limpo) return null;

  // Se tem vírgula, ela é o separador decimal e o ponto é milhar (padrão BR).
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo;

  const valor = Number(normalizado);
  if (!Number.isFinite(valor) || valor < 0) return null;
  return Math.round(valor * 100);
}

/** "11987654321" -> "(11) 98765-4321" */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}

/** Link de conversa no WhatsApp a partir de um telefone brasileiro. */
export function whatsappLink(raw: string, message?: string): string {
  const d = raw.replace(/\D/g, "");
  const comPais = d.startsWith("55") ? d : `55${d}`;
  const texto = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${comPais}${texto}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTimeShort(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro na entrega",
  pix: "Pix",
  cartao: "Cartão na entrega",
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  aguardando: "Aguardando confirmação",
  aceito: "Aceito",
  em_preparo: "Em preparo",
  saiu_entrega: "Saiu para entrega",
  entregue: "Entregue",
  recusado: "Recusado",
  cancelado: "Cancelado",
};

/** Frase amigável mostrada ao cliente na tela de acompanhamento. */
export const STATUS_MESSAGE: Record<OrderStatus, string> = {
  aguardando: "Recebemos seu pedido! Estamos conferindo tudo para confirmar.",
  aceito: "Seu pedido foi aceito. Já vamos começar a separar os produtos.",
  em_preparo: "Estamos separando seus produtos com carinho.",
  saiu_entrega: "Seu pedido saiu para entrega. Já já chega aí!",
  entregue: "Pedido entregue. Obrigada pela preferência!",
  recusado: "Infelizmente não foi possível atender este pedido.",
  cancelado: "Este pedido foi cancelado.",
};

/** Etapas mostradas na linha do tempo, na ordem. */
export const STATUS_FLOW: OrderStatus[] = [
  "aguardando",
  "aceito",
  "em_preparo",
  "saiu_entrega",
  "entregue",
];

export function isFinalStatus(status: OrderStatus): boolean {
  return status === "entregue" || status === "recusado" || status === "cancelado";
}

/** O próximo status do fluxo normal, ou null se não há para onde avançar. */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = STATUS_FLOW.indexOf(status);
  if (i === -1 || i === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[i + 1];
}

export function formatAddress(order: Order): string {
  const linha1 = [
    `${order.addr_street}, ${order.addr_number}`,
    order.addr_complement || null,
  ]
    .filter(Boolean)
    .join(" - ");

  const linha2 = [order.addr_district, order.addr_city].filter(Boolean).join(" - ");
  const partes = [linha1, linha2];
  if (order.addr_zip) partes.push(`CEP ${order.addr_zip}`);
  if (order.addr_reference) partes.push(`Referência: ${order.addr_reference}`);
  return partes.join("\n");
}
