"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { lerPedidos, type PedidoSalvo } from "@/lib/meusPedidos";
import { formatDateTimeShort } from "@/lib/format";

export default function PaginaAcompanhar() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [salvos, setSalvos] = useState<PedidoSalvo[]>([]);

  useEffect(() => setSalvos(lerPedidos()), []);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const limpo = codigo.trim().toUpperCase();
    const completo = limpo.startsWith("JN-") ? limpo : `JN-${limpo}`;

    if (!/^JN-[A-Z0-9]{6}$/.test(completo)) {
      setErro("O código tem 6 letras e números depois do JN-. Exemplo: JN-7K3QD9");
      return;
    }
    router.push(`/pedido/${completo}`);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Acompanhar pedido</h1>
        <p className="text-sm text-slate-500">
          Digite o código que você recebeu ao finalizar o pedido.
        </p>
      </div>

      <form onSubmit={enviar} className="cartao space-y-3 p-4">
        <Campo id="codigo" label="Código do pedido" obrigatorio erro={erro}>
          <input
            id="codigo"
            className={`campo text-center text-lg tracking-widest uppercase ${erro ? "campo-erro" : ""}`}
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value);
              setErro("");
            }}
            placeholder="JN-7K3QD9"
            autoCapitalize="characters"
            autoComplete="off"
          />
        </Campo>
        <button type="submit" className="btn-primario w-full">
          Ver meu pedido
        </button>
      </form>

      {salvos.length > 0 && (
        <section className="cartao p-4">
          <h2 className="mb-2 font-bold text-slate-900">Seus pedidos recentes</h2>
          <ul className="divide-y divide-slate-100">
            {salvos.map((p) => (
              <li key={p.code}>
                <Link
                  href={`/pedido/${p.code}`}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <span>
                    <span className="font-semibold text-slate-800">Pedido #{p.number}</span>
                    <span className="block text-sm text-slate-500">
                      {p.code} · {formatDateTimeShort(p.criadoEm)}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-marca-600">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href="/" className="btn-secundario w-full">
        Voltar para a loja
      </Link>
    </div>
  );
}
