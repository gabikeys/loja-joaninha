import { FormularioCheckout } from "@/components/loja/FormularioCheckout";
import { getClienteLogado } from "@/lib/conta";
import { getStoreSettings } from "@/lib/data";
import { formatPhone } from "@/lib/format";

export const metadata = { title: "Finalizar pedido — Loja da Joaninha" };

export default async function PaginaCheckout() {
  const [config, cliente] = await Promise.all([getStoreSettings(), getClienteLogado()]);
  const p = cliente?.perfil;

  // Quem está logado recebe o formulário já preenchido. Quem não está recebe
  // tudo em branco e compra do mesmo jeito — conta é opcional.
  const dadosIniciais = {
    customerName: p?.full_name ?? "",
    customerPhone: p?.phone ? formatPhone(p.phone) : "",
    customerEmail: cliente?.email ?? "",
    addrZip: p?.addr_zip ?? "",
    addrStreet: p?.addr_street ?? "",
    addrNumber: p?.addr_number ?? "",
    addrComplement: p?.addr_complement ?? "",
    addrDistrict: p?.addr_district ?? "",
    addrCity: p?.addr_city ?? "",
    addrReference: p?.addr_reference ?? "",
  };

  return (
    <FormularioCheckout
      infoEntrega={config.delivery_info}
      logado={Boolean(cliente)}
      dadosIniciais={dadosIniciais}
    />
  );
}
