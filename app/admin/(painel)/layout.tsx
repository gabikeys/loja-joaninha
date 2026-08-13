import Link from "next/link";
import { BotaoSair } from "@/components/admin/BotaoSair";
import { NavPainel } from "@/components/admin/NavPainel";
import { exigirAdmin } from "@/lib/admin";

export const metadata = { title: "Painel — Loja da Joaninha" };
export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await exigirAdmin();

  const [{ data: config }, { count }] = await Promise.all([
    supabase.from("store_settings").select("store_name").eq("id", 1).maybeSingle(),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "aguardando"),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-bold">{config?.store_name ?? "Painel"}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Ver loja
            </Link>
            <BotaoSair className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">{children}</main>

      <NavPainel novosPedidos={count ?? 0} />
    </div>
  );
}
