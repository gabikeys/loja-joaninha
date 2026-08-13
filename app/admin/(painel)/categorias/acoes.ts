"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/admin";
import type { EstadoAcao } from "@/lib/estado-acao";
import { categoriaSchema, errosPorCampo } from "@/lib/validation";

function atualizarTelas() {
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

/** Cria ou renomeia uma categoria. */
export async function salvarCategoria(
  _anterior: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const { supabase } = await exigirAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const analise = categoriaSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    active: formData.get("active") !== "false",
  });

  if (!analise.success) {
    return { ok: false, campos: errosPorCampo(analise.error) };
  }

  const { name, active } = analise.data;

  if (id) {
    const { error } = await supabase.from("categories").update({ name, active }).eq("id", id);
    if (error) return { ok: false, erro: "Não conseguimos salvar. Tente de novo." };
  } else {
    // Categoria nova entra no fim da lista.
    const { data: ultima } = await supabase
      .from("categories")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase.from("categories").insert({
      name,
      active,
      position: (ultima?.position ?? 0) + 1,
    });
    if (error) return { ok: false, erro: "Não conseguimos criar a categoria. Tente de novo." };
  }

  atualizarTelas();
  redirect(`/admin/categorias?msg=${id ? "salva" : "criada"}`);
}

export async function alternarCategoriaAtiva(formData: FormData) {
  const { supabase } = await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const ativar = formData.get("ativar") === "1";

  await supabase.from("categories").update({ active: ativar }).eq("id", id);
  atualizarTelas();
}

export async function excluirCategoria(formData: FormData) {
  const { supabase } = await exigirAdmin();
  const id = String(formData.get("id") ?? "");

  // Os produtos NÃO são apagados: ficam "sem categoria" e seguem na vitrine.
  await supabase.from("categories").delete().eq("id", id);
  atualizarTelas();
  redirect("/admin/categorias?msg=excluida");
}

/** Sobe ou desce a categoria na ordem da vitrine. */
export async function moverCategoria(formData: FormData) {
  const { supabase } = await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const direcao = formData.get("direcao") === "cima" ? -1 : 1;

  const { data: lista } = await supabase
    .from("categories")
    .select("id")
    .order("position")
    .order("created_at");

  if (!lista) return;

  const atual = lista.findIndex((c) => c.id === id);
  const destino = atual + direcao;
  if (atual === -1 || destino < 0 || destino >= lista.length) return;

  const nova = [...lista];
  [nova[atual], nova[destino]] = [nova[destino], nova[atual]];

  // Reescreve todas as posições: garante uma sequência limpa mesmo que os
  // valores antigos estivessem repetidos ou zerados.
  await Promise.all(
    nova.map((c, i) => supabase.from("categories").update({ position: i + 1 }).eq("id", c.id))
  );

  atualizarTelas();
}
