"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/admin/pedidos", rotulo: "Pedidos", emoji: "🧾" },
  { href: "/admin/produtos", rotulo: "Produtos", emoji: "🧴" },
  { href: "/admin/categorias", rotulo: "Categorias", emoji: "🏷️" },
  { href: "/admin/configuracoes", rotulo: "Ajustes", emoji: "⚙️" },
];

/** Barra de navegação fixa no rodapé — é assim que ela vai usar no celular. */
export function NavPainel({ novosPedidos = 0 }: { novosPedidos?: number }) {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-30 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-3xl">
        {ITENS.map((item) => {
          const ativo = pathname.startsWith(item.href);
          const mostrarBadge = item.href === "/admin/pedidos" && novosPedidos > 0;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors ${
                  ativo ? "text-marca-700" : "text-slate-500"
                }`}
              >
                <span className="text-xl leading-none" aria-hidden="true">
                  {item.emoji}
                </span>
                {item.rotulo}
                {mostrarBadge && (
                  <span className="absolute top-1 right-1/2 translate-x-5 rounded-full bg-marca-600 px-1.5 text-[11px] leading-4 font-bold text-white">
                    {novosPedidos}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
