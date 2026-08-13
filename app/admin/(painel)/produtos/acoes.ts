"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/admin";
import type { EstadoAcao } from "@/lib/estado-acao";
import { PRODUCTS_BUCKET } from "@/lib/env";
import { parseBRLToCents } from "@/lib/format";
import { errosPorCampo, produtoSchema } from "@/lib/validation";
import type { SupabaseClient } from "@supabase/supabase-js";

function atualizarTelas() {
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

/** Apaga a foto do Storage para não deixar lixo acumulado. */
async function apagarFoto(supabase: SupabaseClient, caminho: string | null) {
  if (!caminho) return;
  const { error } = await supabase.storage.from(PRODUCTS_BUCKET).remove([caminho]);
  if (error) console.warn("[produtos] Não consegui apagar a foto antiga:", error.message);
}

/** Cria ou atualiza um produto. */
export async function salvarProduto(
  _anterior: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const { supabase } = await exigirAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const categoriaBruta = String(formData.get("categoryId") ?? "").trim();

  const analise = produtoSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    sizeLabel: String(formData.get("sizeLabel") ?? ""),
    priceCents: parseBRLToCents(String(formData.get("price") ?? "")) ?? Number.NaN,
    categoryId: categoriaBruta === "" ? null : categoriaBruta,
    imagePath: String(formData.get("imagePath") ?? ""),
    active: formData.get("active") === "1",
  });

  if (!analise.success) {
    return { ok: false, campos: errosPorCampo(analise.error) };
  }

  const dados = analise.data;
  const registro = {
    name: dados.name,
    description: dados.description,
    size_label: dados.sizeLabel,
    price_cents: dados.priceCents,
    category_id: dados.categoryId,
    image_path: dados.imagePath,
    active: dados.active,
  };

  if (id) {
    const { data: antigo } = await supabase
      .from("products")
      .select("image_path")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("products").update(registro).eq("id", id);
    if (error) {
      console.error("[produtos] Erro ao atualizar:", error);
      return { ok: false, erro: "Não conseguimos salvar o produto. Tente de novo." };
    }

    if (antigo?.image_path && antigo.image_path !== dados.imagePath) {
      await apagarFoto(supabase, antigo.image_path);
    }
  } else {
    const { data: ultimo } = await supabase
      .from("products")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase
      .from("products")
      .insert({ ...registro, position: (ultimo?.position ?? 0) + 1 });

    if (error) {
      console.error("[produtos] Erro ao criar:", error);
      return { ok: false, erro: "Não conseguimos cadastrar o produto. Tente de novo." };
    }
  }

  atualizarTelas();
  redirect(`/admin/produtos?msg=${id ? "salvo" : "criado"}`);
}

export async function alternarProdutoAtivo(formData: FormData) {
  const { supabase } = await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const ativar = formData.get("ativar") === "1";

  await supabase.from("products").update({ active: ativar }).eq("id", id);
  atualizarTelas();
}

export async function duplicarProduto(formData: FormData) {
  const { supabase } = await exigirAdmin();
  const id = String(formData.get("id") ?? "");

  const { data: original } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!original) return;

  const { data: ultimo } = await supabase
    .from("products")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  // A cópia nasce desativada para ela ajustar antes de mostrar na loja.
  const { data: copia } = await supabase
    .from("products")
    .insert({
      name: `${original.name} (cópia)`.slice(0, 120),
      description: original.description,
      size_label: original.size_label,
      price_cents: original.price_cents,
      category_id: original.category_id,
      image_path: original.image_path,
      active: false,
      position: (ultimo?.position ?? 0) + 1,
    })
    .select("id")
    .single();

  atualizarTelas();
  if (copia) redirect(`/admin/produtos/${copia.id}?msg=duplicado`);
}

export async function excluirProduto(formData: FormData) {
  const { supabase } = await exigirAdmin();
  const id = String(formData.get("id") ?? "");

  const { data: produto } = await supabase
    .from("products")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("[produtos] Erro ao excluir:", error);
    redirect("/admin/produtos?msg=erro-excluir");
  }

  await apagarFoto(supabase, produto?.image_path ?? null);
  atualizarTelas();
  redirect("/admin/produtos?msg=excluido");
}

/** Sobe ou desce o produto na ordem da vitrine. */
export async function moverProduto(formData: FormData) {
  const { supabase } = await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const direcao = formData.get("direcao") === "cima" ? -1 : 1;

  const { data: lista } = await supabase
    .from("products")
    .select("id")
    .order("position")
    .order("created_at");

  if (!lista) return;

  const atual = lista.findIndex((p) => p.id === id);
  const destino = atual + direcao;
  if (atual === -1 || destino < 0 || destino >= lista.length) return;

  const nova = [...lista];
  [nova[atual], nova[destino]] = [nova[destino], nova[atual]];

  await Promise.all(
    nova.map((p, i) => supabase.from("products").update({ position: i + 1 }).eq("id", p.id))
  );

  atualizarTelas();
}
