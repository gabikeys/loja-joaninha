"use client";

import { useRef, useState } from "react";
import { PRODUCTS_BUCKET, productImageUrl } from "@/lib/env";
import { tratarFoto } from "@/lib/imagem";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  /** Caminho já salvo no banco, quando está editando um produto. */
  caminhoInicial: string | null;
  /** Avisa o formulário para atualizar a pré-visualização. */
  aoMudar: (caminho: string | null, previewUrl: string | null) => void;
};

type Situacao = "parado" | "preparando" | "enviando" | "erro";

/**
 * Foto do produto: ela aperta, escolhe (câmera ou galeria) e pronto.
 * O redimensionamento e a compressão acontecem aqui, no aparelho dela,
 * antes de subir — sem app de edição, sem espera longa no 4G.
 */
export function CampoFoto({ caminhoInicial, aoMudar }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [caminho, setCaminho] = useState<string | null>(caminhoInicial);
  const [preview, setPreview] = useState<string | null>(productImageUrl(caminhoInicial));
  const [situacao, setSituacao] = useState<Situacao>("parado");
  const [erro, setErro] = useState<string | null>(null);

  // Fotos enviadas nesta tela mas ainda não salvas: se ela trocar de foto de
  // novo, apagamos a anterior para não deixar arquivo solto no Storage.
  const temporarias = useRef<string[]>([]);

  function atualizar(novoCaminho: string | null, novoPreview: string | null) {
    setCaminho(novoCaminho);
    setPreview(novoPreview);
    aoMudar(novoCaminho, novoPreview);
  }

  async function escolher(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;

    setErro(null);
    setSituacao("preparando");

    try {
      const foto = await tratarFoto(arquivo);
      setPreview(foto.previewUrl);
      setSituacao("enviando");

      const supabase = createSupabaseBrowserClient();
      const nome = `${crypto.randomUUID()}.${foto.extensao}`;

      const { error } = await supabase.storage
        .from(PRODUCTS_BUCKET)
        .upload(nome, foto.blob, {
          contentType: foto.blob.type,
          cacheControl: "31536000",
          upsert: false,
        });

      if (error) {
        console.error("[foto] upload:", error);
        setSituacao("erro");
        setErro(
          "Não conseguimos enviar a foto. Verifique sua internet e tente de novo."
        );
        setPreview(productImageUrl(caminho));
        return;
      }

      // Apaga a foto temporária anterior, se houver.
      const anterior = temporarias.current.pop();
      if (anterior) {
        await supabase.storage.from(PRODUCTS_BUCKET).remove([anterior]);
      }
      temporarias.current.push(nome);

      atualizar(nome, foto.previewUrl);
      setSituacao("parado");
    } catch (e) {
      console.error("[foto] preparo:", e);
      setSituacao("erro");
      setErro(e instanceof Error ? e.message : "Não foi possível usar essa foto.");
      setPreview(productImageUrl(caminho));
    }
  }

  function remover() {
    atualizar(null, null);
    setErro(null);
    setSituacao("parado");
  }

  const ocupado = situacao === "preparando" || situacao === "enviando";

  return (
    <div>
      <span className="rotulo">Foto do produto</span>

      {/* O valor que vai para o banco. */}
      <input type="hidden" name="imagePath" value={caminho ?? ""} />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={escolher}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="flex items-center gap-3">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Foto do produto" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-3xl text-slate-300">
              📷
            </div>
          )}

          {ocupado && (
            <div className="absolute inset-0 grid place-items-center bg-white/80 text-center text-xs font-semibold text-marca-700">
              <span>
                <span className="mb-1 block animate-spin text-lg">◌</span>
                {situacao === "preparando" ? "Preparando..." : "Enviando..."}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={ocupado}
            className="btn-primario btn-sm w-full"
          >
            {preview ? "Trocar foto" : "Adicionar foto"}
          </button>

          {preview && !ocupado && (
            <button type="button" onClick={remover} className="btn-secundario btn-sm w-full">
              Remover foto
            </button>
          )}

          <p className="ajuda">
            Pode tirar na hora com a câmera. A gente ajusta o tamanho sozinho.
          </p>
        </div>
      </div>

      {erro && (
        <p className="msg-erro" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
