/**
 * Resultado padrão das ações do painel (useActionState).
 * Fica num arquivo separado porque é usado tanto no servidor quanto nos
 * formulários do navegador.
 */
export type EstadoAcao = {
  ok: boolean;
  /** Erro geral, mostrado no topo do formulário. */
  erro?: string;
  /** Erros por campo: { name: "Escreva o nome do produto." } */
  campos?: Record<string, string>;
};

export const ESTADO_INICIAL: EstadoAcao = { ok: false };
