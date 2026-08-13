type Props = {
  url: string | null;
  nome: string;
  className?: string;
};

/**
 * Foto do produto com um espaço reservado bonitinho quando ela ainda não
 * cadastrou a imagem — melhor do que um quadrado quebrado.
 */
export function FotoProduto({ url, nome, className = "" }: Props) {
  if (!url) {
    return (
      <div
        className={`grid place-items-center bg-agua-50 text-2xl text-agua-600 ${className}`}
        aria-hidden="true"
      >
        🧴
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={nome}
      loading="lazy"
      decoding="async"
      className={`bg-slate-100 object-cover ${className}`}
    />
  );
}
