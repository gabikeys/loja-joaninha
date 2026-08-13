"use client";

/**
 * Trata a foto no próprio celular, antes de subir.
 *
 * A Joaninha vai tirar foto com a câmera do telefone — são arquivos de 4 a 12 MB,
 * girados pelo sensor e grandes demais para a vitrine. Aqui a gente:
 *   • corrige a rotação (EXIF) para a foto não subir deitada
 *   • reduz para no máximo 1280px no lado maior
 *   • comprime em WebP até caber no tamanho alvo
 *
 * Ela não precisa saber que nada disso existe.
 */

const LADO_MAXIMO = 1280;
const ALVO_BYTES = 300 * 1024;

export type FotoTratada = {
  blob: Blob;
  extensao: "webp" | "jpg";
  largura: number;
  altura: number;
  previewUrl: string;
};

async function carregarBitmap(arquivo: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      // "from-image" respeita a orientação registrada pela câmera.
      return await createImageBitmap(arquivo, { imageOrientation: "from-image" });
    } catch {
      // Safari antigo não aceita a opção; cai no caminho abaixo.
    }
  }

  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível abrir essa imagem."));
    img.src = URL.createObjectURL(arquivo);
  });
}

function paraBlob(canvas: HTMLCanvasElement, tipo: string, qualidade: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, tipo, qualidade));
}

export async function tratarFoto(arquivo: File): Promise<FotoTratada> {
  if (!arquivo.type.startsWith("image/")) {
    throw new Error("Esse arquivo não é uma foto. Escolha uma imagem.");
  }

  const fonte = await carregarBitmap(arquivo);
  const larguraOriginal = "width" in fonte ? fonte.width : 0;
  const alturaOriginal = "height" in fonte ? fonte.height : 0;

  if (!larguraOriginal || !alturaOriginal) {
    throw new Error("Não foi possível ler essa foto. Tente outra.");
  }

  const escala = Math.min(1, LADO_MAXIMO / Math.max(larguraOriginal, alturaOriginal));
  const largura = Math.round(larguraOriginal * escala);
  const altura = Math.round(alturaOriginal * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não conseguiu preparar a foto.");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(fonte as CanvasImageSource, 0, 0, largura, altura);
  if ("close" in fonte) fonte.close();

  // Tenta WebP (bem menor); se o navegador não gerar, usa JPEG.
  for (const [tipo, extensao] of [
    ["image/webp", "webp"],
    ["image/jpeg", "jpg"],
  ] as const) {
    let blob: Blob | null = null;

    for (const qualidade of [0.82, 0.7, 0.6, 0.5]) {
      blob = await paraBlob(canvas, tipo, qualidade);
      if (blob && blob.type === tipo && blob.size <= ALVO_BYTES) break;
    }

    if (blob && blob.type === tipo) {
      return {
        blob,
        extensao,
        largura,
        altura,
        previewUrl: URL.createObjectURL(blob),
      };
    }
  }

  throw new Error("Não foi possível preparar essa foto. Tente tirar outra.");
}
