import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Porta de entrada de tudo que é do painel.
 * O RLS do banco já bloqueia quem não é admin; isto aqui é a segunda tranca,
 * e garante que a pessoa veja uma tela explicando, em vez de um erro seco.
 */
export async function exigirAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (perfil?.role !== "admin") redirect("/admin/sem-acesso");

  return { supabase, user };
}
