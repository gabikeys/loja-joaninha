import { z } from "zod";

/** Só os dígitos do telefone/CEP. */
const soDigitos = (v: string) => v.replace(/\D/g, "");

/**
 * Campo de texto obrigatório, já sem espaços nas pontas.
 * A mesma mensagem vale para "veio errado" e para "não veio" — assim a API
 * nunca devolve o texto padrão do zod, que é em inglês.
 */
const texto = (min: number, max: number, msg: string) =>
  z
    .string({ error: msg })
    .transform((v) => v.trim())
    .refine((v) => v.length >= min && v.length <= max, { message: msg });

/** Campo opcional: vira null quando vem vazio, nulo ou ausente. */
const opcional = (max: number) =>
  z
    .string()
    .nullish()
    .transform((v) => (v ?? "").trim().slice(0, max) || null);

const email = z
  .string()
  .nullish()
  .transform((v) => (v ?? "").trim().toLowerCase() || null)
  .refine((v) => v === null || z.email().safeParse(v).success, {
    message: "Esse e-mail não parece válido.",
  });

const telefone = (obrigatorio: boolean) =>
  z
    .string()
    .nullish()
    .transform((v) => soDigitos(v ?? ""))
    .refine((v) => (v === "" ? !obrigatorio : v.length === 10 || v.length === 11), {
      message: "Digite o WhatsApp com DDD. Exemplo: (11) 98765-4321",
    });

// ---------------------------------------------------------------------------
// Pedido do cliente
// ---------------------------------------------------------------------------

export const novoPedidoSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid("Produto inválido."),
        quantity: z
          .number({ error: "Quantidade inválida." })
          .int("Quantidade inválida.")
          .min(1, "A quantidade precisa ser pelo menos 1.")
          .max(99, "A quantidade máxima por produto é 99."),
      }),
      { error: "Seu carrinho está vazio." }
    )
    .min(1, "Seu carrinho está vazio.")
    .max(60, "Pedido muito grande. Fale com a loja pelo WhatsApp."),

  customerName: texto(2, 80, "Escreva seu nome completo."),
  customerPhone: telefone(true),
  customerEmail: email,

  addrStreet: texto(2, 120, "Informe a rua."),
  addrNumber: texto(1, 20, "Informe o número."),
  addrComplement: opcional(80),
  addrDistrict: texto(2, 80, "Informe o bairro."),
  addrCity: texto(2, 80, "Informe a cidade."),
  addrReference: opcional(120),
  addrZip: z
    .string()
    .nullish()
    .transform((v) => {
      const d = soDigitos(v ?? "");
      if (d.length === 8) return `${d.slice(0, 5)}-${d.slice(5)}`;
      return d || null;
    }),

  paymentMethod: z.enum(["dinheiro", "pix", "cartao"], {
    message: "Escolha a forma de pagamento.",
  }),

  /** Só faz sentido no dinheiro: "preciso de troco para R$ 50". */
  changeForCents: z
    .number()
    .int()
    .min(0)
    .max(1_000_000)
    .nullish()
    .transform((v) => v ?? null),

  notes: opcional(500),
});

export type NovoPedidoEntrada = z.input<typeof novoPedidoSchema>;
export type NovoPedidoValidado = z.output<typeof novoPedidoSchema>;

/** Transforma os erros do zod em { campo: "mensagem" } para exibir no formulário. */
export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const issue of erro.issues) {
    const campo = issue.path.join(".") || "form";
    if (!saida[campo]) saida[campo] = issue.message;
  }
  return saida;
}

// ---------------------------------------------------------------------------
// Painel da Joaninha
// ---------------------------------------------------------------------------

export const produtoSchema = z.object({
  name: texto(2, 120, "Escreva o nome do produto."),
  description: opcional(500),
  sizeLabel: opcional(40),
  priceCents: z
    .number({ message: "Digite o preço. Exemplo: 12,90" })
    .int({ message: "Digite o preço. Exemplo: 12,90" })
    .min(1, "O preço precisa ser maior que zero.")
    .max(9_999_999, "Esse preço parece alto demais. Confira os números."),
  categoryId: z.uuid().nullish().transform((v) => v ?? null),
  imagePath: opcional(300),
  active: z.boolean(),
});

export const categoriaSchema = z.object({
  name: texto(2, 60, "Escreva o nome da categoria."),
  active: z.boolean(),
});

export const configuracoesSchema = z.object({
  storeName: texto(2, 80, "Escreva o nome da loja."),
  whatsapp: telefone(false),
  adminEmail: email,
  deliveryInfo: texto(0, 120, "Esse texto ficou longo demais."),
  openingHoursText: texto(0, 200, "Esse texto ficou longo demais."),
  notice: texto(0, 200, "O recado precisa ser mais curto."),
});
