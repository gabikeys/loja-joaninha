import { FormularioConfiguracoes } from "@/components/admin/FormularioConfiguracoes";
import { Aviso } from "@/components/ui/Aviso";
import { exigirAdmin } from "@/lib/admin";
import type { StoreSettings } from "@/lib/types";

export const metadata = { title: "Configurações — Painel" };

export default async function PaginaConfiguracoes({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const { supabase } = await exigirAdmin();
  const { msg } = await searchParams;

  const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">Configurações da loja</h1>
        <p className="text-sm text-slate-500">
          Estes dados aparecem para o cliente e definem para onde vão os pedidos.
        </p>
      </div>

      {msg === "salvo" && <Aviso tipo="sucesso">Configurações salvas!</Aviso>}

      <FormularioConfiguracoes config={data as StoreSettings} />
    </>
  );
}
