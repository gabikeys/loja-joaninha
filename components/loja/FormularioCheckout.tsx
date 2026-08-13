"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCarrinho } from "./CarrinhoProvider";
import { Campo } from "@/components/ui/Campo";
import { formatBRL, PAYMENT_LABEL } from "@/lib/format";
import { dinheiroParaCentavos, mascaraCep, mascaraDinheiro, mascaraTelefone } from "@/lib/mascaras";
import { salvarPedido } from "@/lib/meusPedidos";
import type { PaymentMethod } from "@/lib/types";

type Erros = Record<string, string>;

const PAGAMENTOS: { valor: PaymentMethod; emoji: string }[] = [
  { valor: "dinheiro", emoji: "💵" },
  { valor: "pix", emoji: "📱" },
  { valor: "cartao", emoji: "💳" },
];

export function FormularioCheckout({ infoEntrega }: { infoEntrega: string }) {
  const router = useRouter();
  const { itens, carregado, totalCentavos, limpar } = useCarrinho();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    addrZip: "",
    addrStreet: "",
    addrNumber: "",
    addrComplement: "",
    addrDistrict: "",
    addrCity: "",
    addrReference: "",
    notes: "",
    trocoPara: "",
  });
  const [pagamento, setPagamento] = useState<PaymentMethod | "">("");
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const mudar = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let valor = e.target.value;
    if (campo === "customerPhone") valor = mascaraTelefone(valor);
    if (campo === "addrZip") valor = mascaraCep(valor);
    if (campo === "trocoPara") valor = mascaraDinheiro(valor);
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e2) => (e2[campo] ? { ...e2, [campo]: "" } : e2));
  };

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroGeral(null);

    if (!pagamento) {
      setErros((e) => ({ ...e, paymentMethod: "Escolha a forma de pagamento." }));
      document.getElementById("pagamento")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setEnviando(true);
    try {
      const resposta = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itens.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerEmail: form.customerEmail,
          addrStreet: form.addrStreet,
          addrNumber: form.addrNumber,
          addrComplement: form.addrComplement,
          addrDistrict: form.addrDistrict,
          addrCity: form.addrCity,
          addrReference: form.addrReference,
          addrZip: form.addrZip,
          paymentMethod: pagamento,
          changeForCents: pagamento === "dinheiro" ? dinheiroParaCentavos(form.trocoPara) : null,
          notes: form.notes,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setErros(dados.campos ?? {});
        setErroGeral(dados.erro ?? "Não conseguimos enviar seu pedido. Tente de novo.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      salvarPedido({ code: dados.code, number: dados.number, criadoEm: new Date().toISOString() });
      limpar();
      router.push(`/pedido/${dados.code}?novo=1`);
    } catch {
      setErroGeral("Sem conexão. Verifique sua internet e tente novamente.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setEnviando(false);
    }
  }

  if (carregado && itens.length === 0) {
    return (
      <div className="cartao mt-6 p-8 text-center">
        <p className="text-4xl">🛒</p>
        <h1 className="mt-3 text-lg font-bold text-slate-800">Seu carrinho está vazio</h1>
        <p className="mt-1 text-slate-600">Escolha os produtos antes de finalizar o pedido.</p>
        <Link href="/" className="btn-primario mt-5 w-full">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-5 pb-4">
      <h1 className="text-xl font-bold text-slate-900">Finalizar pedido</h1>

      {erroGeral && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          {erroGeral}
        </div>
      )}

      {/* ------------------------------------------------ resumo */}
      <section className="cartao p-4">
        <h2 className="mb-2 font-bold text-slate-900">Seu pedido</h2>
        <ul className="space-y-1 text-sm text-slate-600">
          {itens.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3">
              <span className="min-w-0">
                {i.quantity}x {i.name}
              </span>
              <span className="whitespace-nowrap">{formatBRL(i.priceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
          <span>Total</span>
          <span>{formatBRL(totalCentavos)}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Entrega: {infoEntrega}</p>
        <Link href="/carrinho" className="mt-2 inline-block text-sm font-semibold text-marca-700 underline">
          Alterar itens
        </Link>
      </section>

      {/* ------------------------------------------------ contato */}
      <section className="cartao space-y-4 p-4">
        <h2 className="font-bold text-slate-900">Seus dados</h2>

        <Campo id="nome" label="Nome completo" obrigatorio erro={erros.customerName}>
          <input
            id="nome"
            className={`campo ${erros.customerName ? "campo-erro" : ""}`}
            value={form.customerName}
            onChange={mudar("customerName")}
            autoComplete="name"
            placeholder="Maria da Silva"
          />
        </Campo>

        <Campo
          id="whatsapp"
          label="WhatsApp"
          obrigatorio
          erro={erros.customerPhone}
          ajuda="É por aqui que a loja fala com você sobre a entrega."
        >
          <input
            id="whatsapp"
            className={`campo ${erros.customerPhone ? "campo-erro" : ""}`}
            value={form.customerPhone}
            onChange={mudar("customerPhone")}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="(11) 98765-4321"
          />
        </Campo>

        <Campo
          id="email"
          label="E-mail"
          erro={erros.customerEmail}
          ajuda="Se preencher, avisamos por e-mail cada vez que seu pedido andar."
        >
          <input
            id="email"
            type="email"
            className={`campo ${erros.customerEmail ? "campo-erro" : ""}`}
            value={form.customerEmail}
            onChange={mudar("customerEmail")}
            autoComplete="email"
            placeholder="maria@email.com"
          />
        </Campo>
      </section>

      {/* ------------------------------------------------ endereço */}
      <section className="cartao space-y-4 p-4">
        <h2 className="font-bold text-slate-900">Endereço de entrega</h2>

        <div className="grid grid-cols-2 gap-3">
          <Campo id="cep" label="CEP" erro={erros.addrZip}>
            <input
              id="cep"
              className={`campo ${erros.addrZip ? "campo-erro" : ""}`}
              value={form.addrZip}
              onChange={mudar("addrZip")}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
            />
          </Campo>

          <Campo id="numero" label="Número" obrigatorio erro={erros.addrNumber}>
            <input
              id="numero"
              className={`campo ${erros.addrNumber ? "campo-erro" : ""}`}
              value={form.addrNumber}
              onChange={mudar("addrNumber")}
              autoComplete="address-line2"
              placeholder="123"
            />
          </Campo>
        </div>

        <Campo id="rua" label="Rua" obrigatorio erro={erros.addrStreet}>
          <input
            id="rua"
            className={`campo ${erros.addrStreet ? "campo-erro" : ""}`}
            value={form.addrStreet}
            onChange={mudar("addrStreet")}
            autoComplete="address-line1"
            placeholder="Rua das Flores"
          />
        </Campo>

        <Campo id="complemento" label="Complemento" erro={erros.addrComplement}>
          <input
            id="complemento"
            className="campo"
            value={form.addrComplement}
            onChange={mudar("addrComplement")}
            placeholder="Apto 42, bloco B"
          />
        </Campo>

        <div className="grid grid-cols-2 gap-3">
          <Campo id="bairro" label="Bairro" obrigatorio erro={erros.addrDistrict}>
            <input
              id="bairro"
              className={`campo ${erros.addrDistrict ? "campo-erro" : ""}`}
              value={form.addrDistrict}
              onChange={mudar("addrDistrict")}
              placeholder="Centro"
            />
          </Campo>

          <Campo id="cidade" label="Cidade" obrigatorio erro={erros.addrCity}>
            <input
              id="cidade"
              className={`campo ${erros.addrCity ? "campo-erro" : ""}`}
              value={form.addrCity}
              onChange={mudar("addrCity")}
              placeholder="São Paulo"
            />
          </Campo>
        </div>

        <Campo
          id="referencia"
          label="Ponto de referência"
          erro={erros.addrReference}
          ajuda="Ajuda muito na hora de achar sua casa."
        >
          <input
            id="referencia"
            className="campo"
            value={form.addrReference}
            onChange={mudar("addrReference")}
            placeholder="Portão verde, em frente à padaria"
          />
        </Campo>
      </section>

      {/* ------------------------------------------------ pagamento */}
      <section id="pagamento" className="cartao space-y-4 p-4">
        <h2 className="font-bold text-slate-900">Como você vai pagar?</h2>

        <div className="grid gap-2">
          {PAGAMENTOS.map(({ valor, emoji }) => (
            <label
              key={valor}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                pagamento === valor
                  ? "border-marca-600 bg-marca-50"
                  : "border-slate-300 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="pagamento"
                value={valor}
                checked={pagamento === valor}
                onChange={() => {
                  setPagamento(valor);
                  setErros((e) => ({ ...e, paymentMethod: "" }));
                }}
                className="h-5 w-5 accent-marca-600"
              />
              <span className="text-xl" aria-hidden="true">
                {emoji}
              </span>
              <span className="font-semibold text-slate-800">{PAYMENT_LABEL[valor]}</span>
            </label>
          ))}
        </div>

        {erros.paymentMethod && (
          <p className="msg-erro" role="alert">
            {erros.paymentMethod}
          </p>
        )}

        {pagamento === "dinheiro" && (
          <Campo
            id="troco"
            label="Precisa de troco para quanto?"
            ajuda="Deixe vazio se tiver o valor certo."
          >
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500">R$</span>
              <input
                id="troco"
                className="campo pl-10"
                value={form.trocoPara}
                onChange={mudar("trocoPara")}
                inputMode="numeric"
                placeholder="50,00"
              />
            </div>
          </Campo>
        )}

        {pagamento === "pix" && (
          <p className="rounded-xl bg-agua-50 p-3 text-sm text-agua-700">
            A chave Pix é enviada pela loja no WhatsApp assim que o pedido for aceito.
          </p>
        )}
      </section>

      {/* ------------------------------------------------ observações */}
      <section className="cartao p-4">
        <Campo id="obs" label="Observações para a loja">
          <textarea
            id="obs"
            className="campo min-h-24"
            value={form.notes}
            onChange={mudar("notes")}
            placeholder="Ex: entregar depois das 18h, tocar o interfone 12..."
          />
        </Campo>
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
        <button type="submit" disabled={enviando} className="btn-primario w-full">
          {enviando ? "Enviando seu pedido..." : `Fazer pedido · ${formatBRL(totalCentavos)}`}
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">
          Você não precisa criar conta. Guardamos o código do pedido para você acompanhar.
        </p>
      </div>
    </form>
  );
}
