import { ConteudoCarrinho } from "@/components/loja/ConteudoCarrinho";
import { getStoreSettings } from "@/lib/data";

export const metadata = { title: "Seu carrinho — Loja da Joaninha" };

export default async function PaginaCarrinho() {
  const config = await getStoreSettings();
  return <ConteudoCarrinho infoEntrega={config.delivery_info} />;
}
