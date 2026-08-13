import Link from "next/link";

export default function PaginaNaoEncontrada() {
  return (
    <div className="mx-auto grid min-h-dvh max-w-md place-items-center p-6">
      <div className="cartao w-full p-8 text-center">
        <p className="text-4xl">🧭</p>
        <h1 className="mt-3 text-lg font-bold text-slate-800">Página não encontrada</h1>
        <p className="mt-1 text-slate-600">O endereço que você abriu não existe.</p>
        <Link href="/" className="btn-primario mt-5 w-full">
          Ir para a loja
        </Link>
      </div>
    </div>
  );
}
