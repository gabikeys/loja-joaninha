import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Conta do cliente — sempre OPCIONAL.
 *
 * Toda tela da loja funciona sem login; estas funções só respondem "tem alguém
 * logado?" para preencher o checkout e mostrar o histórico. Nada aqui pode
 * bloquear quem está comprando como visitante.
 */

export type ClienteLogado = {
  id: string;
  email: string | null;
  perfil: Profile | null;
};

/** Retorna o cliente logado, ou null. Nunca lança erro. */
export async function getClienteLogado(): Promise<ClienteLogado | null> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: perfil } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email ?? null,
      perfil: (perfil as Profile | null) ?? null,
    };
  } catch {
    return null;
  }
}

/** Primeiro nome, para o "Oi, Maria" do cabeçalho. */
export function primeiroNome(cliente: ClienteLogado): string {
  const nome = cliente.perfil?.full_name?.trim();
  if (nome) return nome.split(" ")[0];
  return cliente.email?.split("@")[0] ?? "você";
}
