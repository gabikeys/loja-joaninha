import Link from "next/link";
import { redirect } from "next/navigation";
import { FormularioMinhaConta } from "@/components/loja/FormularioMinhaConta";
import { Aviso } from "@/components/ui/Aviso";
import { BotaoSair } from "@/components/ui/BotaoSair";
import { getClienteLogado } from "@/lib/conta";

export const metadata = { title: "Minha conta — Loja da Joaninha" };

export default async function PaginaMinhaConta({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const cliente = await getClienteLogado();
  if (!cliente) redirect("/entrar?proximo=/minha-conta");

  const { msg } = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">Minha conta</h1>
        <p className="text-sm text-slate-500">{cliente.email}</p>
      </div>

      {msg === "salvo" && <Aviso tipo="sucesso">Seus dados foram salvos!</Aviso>}

      {cliente.perfil?.role === "admin" && (
        <div className="mb-5 rounded-2xl border-2 border-slate-900 bg-slate-900 p-4 text-white">
          <p className="font-bold">🐞 Você é a dona da loja</p>
          <p className="mt-1 mb-3 text-sm text-slate-300">
            Esta tela é a sua conta de cliente. Para cadastrar produtos, ver os pedidos que
            chegaram e mudar as configurações, use o painel.
          </p>
          <Link
            href="/admin/pedidos"
            className="btn-primario w-full bg-white text-slate-900 hover:bg-slate-100"
          >
            Abrir o painel da loja
          </Link>
        </div>
      )}

      <Link href="/meus-pedidos" className="btn-secundario mb-5 w-full justify-between">
        <span>📦 Meus pedidos</span>
        <span aria-hidden="true">→</span>
      </Link>

      <FormularioMinhaConta perfil={cliente.perfil} />

      <div className="mt-2 border-t border-slate-200 pt-4">
        <BotaoSair destino="/" rotulo="Sair da minha conta" className="btn-secundario w-full" />
      </div>
    </div>
  );
}
