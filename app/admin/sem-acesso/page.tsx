import Link from "next/link";
import { BotaoSair } from "@/components/ui/BotaoSair";

export const metadata = { title: "Sem acesso — Painel" };

export default function PaginaSemAcesso() {
  return (
    <div className="mx-auto grid min-h-dvh max-w-md place-items-center p-6">
      <div className="cartao w-full p-6 text-center">
        <p className="text-4xl">🔒</p>
        <h1 className="mt-3 text-lg font-bold text-slate-900">
          Esta conta não tem acesso ao painel
        </h1>
        <p className="mt-2 text-slate-600">
          Entre com a conta da loja. Se você é a dona e está vendo isto, saia e entre de novo
          com o e-mail cadastrado na criação da loja.
        </p>
        <div className="mt-5 space-y-2">
          <BotaoSair className="btn-primario w-full" />
          <Link href="/" className="btn-secundario w-full">
            Ir para a loja
          </Link>
        </div>
      </div>
    </div>
  );
}
