"use client";

import { useActionState, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { BotaoSubmit } from "@/components/ui/FormAcao";
import { ESTADO_INICIAL } from "@/lib/estado-acao";
import { formatPhone } from "@/lib/format";
import { mascaraCep, mascaraTelefone } from "@/lib/mascaras";
import type { Profile } from "@/lib/types";
import { salvarMeusDados } from "@/app/(loja)/minha-conta/acoes";

export function FormularioMinhaConta({ perfil }: { perfil: Profile | null }) {
  const [estado, acao] = useActionState(salvarMeusDados, ESTADO_INICIAL);
  const [telefone, setTelefone] = useState(
    perfil?.phone ? formatPhone(perfil.phone) : ""
  );
  const [cep, setCep] = useState(perfil?.addr_zip ?? "");

  return (
    <form action={acao} className="space-y-5 pb-4">
      {estado.erro && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
          {estado.erro}
        </p>
      )}

      <section className="cartao space-y-4 p-4">
        <h2 className="font-bold text-slate-900">Seus dados</h2>

        <Campo id="fullName" label="Nome completo" erro={estado.campos?.fullName}>
          <input
            id="fullName"
            name="fullName"
            defaultValue={perfil?.full_name ?? ""}
            maxLength={80}
            className="campo"
            autoComplete="name"
            placeholder="Maria da Silva"
          />
        </Campo>

        <Campo id="phone" label="WhatsApp" erro={estado.campos?.phone}>
          <input
            id="phone"
            name="phone"
            value={telefone}
            onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
            inputMode="numeric"
            autoComplete="tel"
            className={`campo ${estado.campos?.phone ? "campo-erro" : ""}`}
            placeholder="(11) 98765-4321"
          />
        </Campo>
      </section>

      <section className="cartao space-y-4 p-4">
        <h2 className="font-bold text-slate-900">Endereço de entrega</h2>
        <p className="-mt-2 text-sm text-slate-500">
          Salvando aqui, seus próximos pedidos já vêm preenchidos.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Campo id="addrZip" label="CEP" erro={estado.campos?.addrZip}>
            <input
              id="addrZip"
              name="addrZip"
              value={cep}
              onChange={(e) => setCep(mascaraCep(e.target.value))}
              inputMode="numeric"
              autoComplete="postal-code"
              className="campo"
              placeholder="00000-000"
            />
          </Campo>

          <Campo id="addrNumber" label="Número" erro={estado.campos?.addrNumber}>
            <input
              id="addrNumber"
              name="addrNumber"
              defaultValue={perfil?.addr_number ?? ""}
              className="campo"
              placeholder="123"
            />
          </Campo>
        </div>

        <Campo id="addrStreet" label="Rua" erro={estado.campos?.addrStreet}>
          <input
            id="addrStreet"
            name="addrStreet"
            defaultValue={perfil?.addr_street ?? ""}
            className="campo"
            autoComplete="address-line1"
            placeholder="Rua das Flores"
          />
        </Campo>

        <Campo id="addrComplement" label="Complemento" erro={estado.campos?.addrComplement}>
          <input
            id="addrComplement"
            name="addrComplement"
            defaultValue={perfil?.addr_complement ?? ""}
            className="campo"
            placeholder="Apto 42, bloco B"
          />
        </Campo>

        <div className="grid grid-cols-2 gap-3">
          <Campo id="addrDistrict" label="Bairro" erro={estado.campos?.addrDistrict}>
            <input
              id="addrDistrict"
              name="addrDistrict"
              defaultValue={perfil?.addr_district ?? ""}
              className="campo"
              placeholder="Centro"
            />
          </Campo>

          <Campo id="addrCity" label="Cidade" erro={estado.campos?.addrCity}>
            <input
              id="addrCity"
              name="addrCity"
              defaultValue={perfil?.addr_city ?? ""}
              className="campo"
              placeholder="São Paulo"
            />
          </Campo>
        </div>

        <Campo
          id="addrReference"
          label="Ponto de referência"
          erro={estado.campos?.addrReference}
          ajuda="Ajuda muito na hora de achar sua casa."
        >
          <input
            id="addrReference"
            name="addrReference"
            defaultValue={perfil?.addr_reference ?? ""}
            className="campo"
            placeholder="Portão verde, em frente à padaria"
          />
        </Campo>
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
        <BotaoSubmit className="btn-primario w-full">Salvar meus dados</BotaoSubmit>
      </div>
    </form>
  );
}
