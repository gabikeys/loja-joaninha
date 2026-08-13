import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Roda antes de cada página. Faz duas coisas:
 *   1. renova a sessão do Supabase (senão a Joaninha seria deslogada sozinha)
 *   2. barra quem não está logado nas páginas /admin
 *
 * No Next 16 este arquivo se chama "proxy" (era "middleware").
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sem env configurado não dá para checar sessão; deixa a página mostrar o aviso.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const ehAreaAdmin = pathname.startsWith("/admin");
  const ehLogin = pathname === "/admin/login";

  if (ehAreaAdmin && !ehLogin && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.searchParams.set("proximo", pathname);
    return NextResponse.redirect(login);
  }

  if (ehLogin && user) {
    const painel = request.nextUrl.clone();
    painel.pathname = "/admin/pedidos";
    painel.search = "";
    return NextResponse.redirect(painel);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Tudo, menos arquivos estáticos, imagens e as rotas de API.
     * A API de pedidos é pública e não usa sessão — passar por aqui só somaria
     * uma ida ao Supabase em cada pedido.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
