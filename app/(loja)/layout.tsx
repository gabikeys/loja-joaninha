import Link from "next/link";
import { CarrinhoProvider } from "@/components/loja/CarrinhoProvider";
import { BotaoCarrinho } from "@/components/loja/BotaoCarrinho";
import { getStoreSettings } from "@/lib/data";
import { formatPhone, whatsappLink } from "@/lib/format";

/**
 * A loja é sempre renderizada na hora.
 * Se ficasse em cache, um produto novo ou uma troca de preço só apareceria no
 * próximo deploy — e a Joaninha edita pelo celular esperando ver na hora.
 */
export const dynamic = "force-dynamic";

export default async function LojaLayout({ children }: { children: React.ReactNode }) {
  const config = await getStoreSettings();

  return (
    <CarrinhoProvider>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 bg-marca-600 text-white shadow-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-lg"
              >
                🐞
              </span>
              <span className="text-lg leading-tight font-bold">
                {config.store_name}
              </span>
            </Link>
            <BotaoCarrinho />
          </div>

          {config.notice.trim() && (
            <p className="bg-marca-800/40 px-4 py-2 text-center text-sm">
              {config.notice}
            </p>
          )}
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">{children}</main>

        <footer className="mt-8 border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
          <p className="font-semibold text-slate-700">{config.store_name}</p>
          {config.opening_hours_text.trim() && (
            <p className="mt-1">{config.opening_hours_text}</p>
          )}
          {config.whatsapp.trim() && (
            <p className="mt-1">
              WhatsApp:{" "}
              <a
                href={whatsappLink(config.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-marca-700 underline"
              >
                {formatPhone(config.whatsapp)}
              </a>
            </p>
          )}
          <p className="mt-3">
            <Link href="/acompanhar" className="underline">
              Acompanhar um pedido
            </Link>
          </p>
        </footer>
      </div>
    </CarrinhoProvider>
  );
}
