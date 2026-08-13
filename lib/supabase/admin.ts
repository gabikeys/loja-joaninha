import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/env";

/**
 * Cliente com privilégio total. IGNORA o RLS — use SOMENTE no servidor e
 * SOMENTE onde é realmente necessário:
 *   • gravar um pedido novo (o cliente não é autenticado)
 *   • ler um pedido pelo código, na tela de acompanhamento
 *
 * Nunca importe este arquivo em um componente com "use client".
 */
export function createSupabaseAdminClient() {
  return createClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
