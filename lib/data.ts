import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category, ProductWithCategory, StoreSettings } from "@/lib/types";

const CONFIG_PADRAO: StoreSettings = {
  id: 1,
  store_name: "Loja da Joaninha",
  whatsapp: "",
  admin_email: "",
  delivery_info: "A combinar com a loja pelo WhatsApp",
  opening_hours_text: "",
  notice: "",
  updated_at: new Date().toISOString(),
};

/**
 * Configurações da loja, lidas no servidor.
 *
 * Usa a chave de serviço porque a tabela guarda o e-mail da dona e por isso não
 * é pública. Nada sensível vai para a tela do cliente — o layout da loja mostra
 * apenas nome, WhatsApp, horário, recado e informação de entrega.
 *
 * Nunca lança erro: se o banco não responder, a loja abre com o texto padrão.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
    return (data as StoreSettings | null) ?? CONFIG_PADRAO;
  } catch {
    return CONFIG_PADRAO;
  }
}

/**
 * Categorias ativas, na ordem definida pela Joaninha.
 *
 * Se a consulta falhar, o erro sobe de propósito: uma lista vazia por causa de
 * banco fora do ar mostraria "a loja está sendo preparada" para o cliente, o que
 * seria mentira. Melhor cair no aviso de erro, que oferece tentar de novo.
 */
export async function getCategoriasAtivas(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("position")
    .order("created_at");

  if (error) throw new Error(`Falha ao carregar categorias: ${error.message}`);
  return (data as Category[] | null) ?? [];
}

/** Produtos da vitrine (só os ativos). Mesma regra de erro das categorias. */
export async function getProdutosDaVitrine(): Promise<ProductWithCategory[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories ( id, name )")
    .eq("active", true)
    .order("position")
    .order("created_at");

  if (error) throw new Error(`Falha ao carregar produtos: ${error.message}`);
  return (data as ProductWithCategory[] | null) ?? [];
}
