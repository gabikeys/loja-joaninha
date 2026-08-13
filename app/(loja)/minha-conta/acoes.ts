"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EstadoAcao } from "@/lib/estado-acao";
import { errosPorCampo, perfilClienteSchema } from "@/lib/validation";

/** Salva nome, telefone e endereço do cliente logado. */
export async function salvarMeusDados(
  _anterior: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar?proximo=/minha-conta");

  const analise = perfilClienteSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    addrStreet: String(formData.get("addrStreet") ?? ""),
    addrNumber: String(formData.get("addrNumber") ?? ""),
    addrComplement: String(formData.get("addrComplement") ?? ""),
    addrDistrict: String(formData.get("addrDistrict") ?? ""),
    addrCity: String(formData.get("addrCity") ?? ""),
    addrReference: String(formData.get("addrReference") ?? ""),
    addrZip: String(formData.get("addrZip") ?? ""),
  });

  if (!analise.success) {
    return { ok: false, campos: errosPorCampo(analise.error) };
  }

  const d = analise.data;

  // A coluna "role" não entra aqui de propósito. E mesmo que entrasse, o
  // gatilho congela_role() no banco impediria alguém de virar admin.
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: d.fullName,
      phone: d.phone,
      addr_street: d.addrStreet,
      addr_number: d.addrNumber,
      addr_complement: d.addrComplement,
      addr_district: d.addrDistrict,
      addr_city: d.addrCity,
      addr_reference: d.addrReference,
      addr_zip: d.addrZip,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[minha-conta] Erro ao salvar:", error);
    return { ok: false, erro: "Não conseguimos salvar agora. Tente de novo." };
  }

  revalidatePath("/minha-conta");
  revalidatePath("/checkout");
  redirect("/minha-conta?msg=salvo");
}
