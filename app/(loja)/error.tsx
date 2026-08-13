"use client";

export default function ErroDaLoja({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="cartao mt-6 p-8 text-center">
      <p className="text-4xl">😕</p>
      <h1 className="mt-3 text-lg font-bold text-slate-800">
        Não conseguimos carregar a loja agora
      </h1>
      <p className="mt-1 text-slate-600">
        Pode ter sido a internet. Tente de novo em alguns segundos.
      </p>
      <button type="button" onClick={reset} className="btn-primario mt-5 w-full">
        Tentar de novo
      </button>
    </div>
  );
}
