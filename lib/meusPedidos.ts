"use client";

const CHAVE = "joaninha:meus-pedidos:v1";

export type PedidoSalvo = { code: string; number: number; criadoEm: string };

/** Guarda no navegador os códigos dos pedidos feitos, para o cliente não perder. */
export function salvarPedido(pedido: PedidoSalvo) {
  try {
    const atuais = lerPedidos().filter((p) => p.code !== pedido.code);
    const novos = [pedido, ...atuais].slice(0, 10);
    window.localStorage.setItem(CHAVE, JSON.stringify(novos));
  } catch {
    // Sem localStorage o cliente ainda tem o código na tela e no e-mail.
  }
}

export function lerPedidos(): PedidoSalvo[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const dados = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(dados) ? dados.filter((p) => typeof p?.code === "string") : [];
  } catch {
    return [];
  }
}
