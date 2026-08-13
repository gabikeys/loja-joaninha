"use client";

export default function ErroDoPainel({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="cartao p-8 text-center">
      <p className="text-4xl">😕</p>
      <h1 className="mt-3 text-lg font-bold text-slate-800">
        Não conseguimos carregar esta tela
      </h1>
      <p className="mt-1 text-slate-600">
        Seus dados estão salvos, isto foi só um problema de conexão. Tente de novo.
      </p>
      <button type="button" onClick={reset} className="btn-primario mt-5 w-full">
        Tentar de novo
      </button>
    </div>
  );
}
