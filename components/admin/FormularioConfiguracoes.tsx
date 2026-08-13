"use client";

import { useActionState, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { BotaoSubmit } from "@/components/ui/FormAcao";
import { ESTADO_INICIAL } from "@/lib/estado-acao";
import { formatPhone } from "@/lib/format";
import { mascaraTelefone } from "@/lib/mascaras";
import type { StoreSettings } from "@/lib/types";
import { salvarConfiguracoes } from "@/app/admin/(painel)/configuracoes/acoes";

export function FormularioConfiguracoes({ config }: { config: StoreSettings }) {
  const [estado, acao] = useActionState(salvarConfiguracoes, ESTADO_INICIAL);
  const [whatsapp, setWhatsapp] = useState(
    config.whatsapp ? formatPhone(config.whatsapp) : ""
  );

  return (
    <form action={acao} className="space-y-5 pb-4">
      {estado.erro && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
          {estado.erro}
        </p>
      )}

      <section className="cartao space-y-4 p-4">
        <h2 className="font-bold text-slate-900">Sua loja</h2>

        <Campo
          id="storeName"
          label="Nome da loja"
          obrigatorio
          erro={estado.campos?.storeName}
          ajuda="Aparece no topo do site e nos e-mails."
        >
          <input
            id="storeName"
            name="storeName"
            defaultValue={config.store_name}
            maxLength={80}
            className={`campo ${estado.campos?.storeName ? "campo-erro" : ""}`}
          />
        </Campo>

        <Campo
          id="whatsapp"
          label="WhatsApp da loja"
          erro={estado.campos?.whatsapp}
          ajuda="O cliente usa este número para falar com você."
        >
          <input
            id="whatsapp"
            name="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(mascaraTelefone(e.target.value))}
            inputMode="numeric"
            className={`campo ${estado.campos?.whatsapp ? "campo-erro" : ""}`}
            placeholder="(11) 98765-4321"
          />
        </Campo>

        <Campo
          id="adminEmail"
          label="E-mail para receber os pedidos"
          erro={estado.campos?.adminEmail}
          ajuda="É para cá que chega o aviso de cada pedido novo. Confira se está certo!"
        >
          <input
            id="adminEmail"
            name="adminEmail"
            type="email"
            defaultValue={config.admin_email}
            className={`campo ${estado.campos?.adminEmail ? "campo-erro" : ""}`}
            placeholder="joaninha@email.com"
          />
        </Campo>
      </section>

      <section className="cartao space-y-4 p-4">
        <h2 className="font-bold text-slate-900">Entrega e atendimento</h2>

        <Campo
          id="deliveryInfo"
          label="Como funciona a entrega"
          erro={estado.campos?.deliveryInfo}
          ajuda="Esta frase aparece para o cliente no carrinho e no pedido."
        >
          <input
            id="deliveryInfo"
            name="deliveryInfo"
            defaultValue={config.delivery_info}
            maxLength={120}
            className={`campo ${estado.campos?.deliveryInfo ? "campo-erro" : ""}`}
            placeholder="A combinar com a loja pelo WhatsApp"
          />
        </Campo>

        <Campo
          id="openingHoursText"
          label="Horário de funcionamento"
          erro={estado.campos?.openingHoursText}
          ajuda="Escreva do seu jeito. Aparece no rodapé do site."
        >
          <input
            id="openingHoursText"
            name="openingHoursText"
            defaultValue={config.opening_hours_text}
            maxLength={200}
            className={`campo ${estado.campos?.openingHoursText ? "campo-erro" : ""}`}
            placeholder="Segunda a sábado, das 8h às 18h"
          />
        </Campo>

        <Campo
          id="notice"
          label="Recado no topo do site"
          erro={estado.campos?.notice}
          ajuda="Use para avisos rápidos. Deixe vazio para não mostrar nada."
        >
          <input
            id="notice"
            name="notice"
            defaultValue={config.notice}
            maxLength={200}
            className={`campo ${estado.campos?.notice ? "campo-erro" : ""}`}
            placeholder="Ex: Hoje as entregas saem só à tarde"
          />
        </Campo>
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
        <BotaoSubmit className="btn-primario w-full">Salvar configurações</BotaoSubmit>
      </div>
    </form>
  );
}
