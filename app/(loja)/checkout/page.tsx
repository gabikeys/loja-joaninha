import { FormularioCheckout } from "@/components/loja/FormularioCheckout";
import { getStoreSettings } from "@/lib/data";

export const metadata = { title: "Finalizar pedido — Loja da Joaninha" };

export default async function PaginaCheckout() {
  const config = await getStoreSettings();
  return <FormularioCheckout infoEntrega={config.delivery_info} />;
}
