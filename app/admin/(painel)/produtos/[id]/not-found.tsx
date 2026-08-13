import Link from "next/link";

export default function ProdutoNaoEncontrado() {
  return (
    <div className="cartao p-8 text-center">
      <p className="text-4xl">🤔</p>
      <h1 className="mt-3 text-lg font-bold text-slate-900">Produto não encontrado</h1>
      <p className="mt-1 text-slate-600">Ele pode ter sido excluído.</p>
      <Link href="/admin/produtos" className="btn-primario mt-5 w-full">
        Ver meus produtos
      </Link>
    </div>
  );
}
