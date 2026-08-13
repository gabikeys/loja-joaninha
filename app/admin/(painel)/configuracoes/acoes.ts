"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/admin";
import type { EstadoAcao } from "@/lib/estado-acao";
import { configuracoesSchema, errosPorCampo } from "@/lib/validation";

export async function salvarConfiguracoes(
  _anterior: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const { supabase } = await exigirAdmin();

  const analise = configuracoesSchema.safeParse({
    storeName: String(formData.get("storeName") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    adminEmail: String(formData.get("adminEmail") ?? ""),
    deliveryInfo: String(formData.get("deliveryInfo") ?? ""),
    openingHoursText: String(formData.get("openingHoursText") ?? ""),
    notice: String(formData.get("notice") ?? ""),
  });

  if (!analise.success) {
    return { ok: false, campos: errosPorCampo(analise.error) };
  }

  const d = analise.data;

  const { error } = await supabase
    .from("store_settings")
    .update({
      store_name: d.storeName,
      whatsapp: d.whatsapp,
      admin_email: d.adminEmail ?? "",
      delivery_info: d.deliveryInfo,
      opening_hours_text: d.openingHoursText,
      notice: d.notice,
    })
    .eq("id", 1);

  if (error) {
    console.error("[configuracoes] Erro ao salvar:", error);
    return { ok: false, erro: "Não conseguimos salvar. Tente de novo em instantes." };
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
  redirect("/admin/configuracoes?msg=salvo");
}
