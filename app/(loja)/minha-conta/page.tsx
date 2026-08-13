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
