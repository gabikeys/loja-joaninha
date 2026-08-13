import Link from "next/link";

export default function PedidoNaoEncontrado() {
  return (
    <div className="cartao mt-6 p-8 text-center">
      <p className="text-4xl">🔎</p>
      <h1 className="mt-3 text-lg font-bold text-slate-800">Não achamos esse pedido</h1>
      <p className="mt-1 text-slate-600">
        Confira se o código está certinho. Ele tem este formato: <strong>JN-7K3QD9</strong>.
      </p>
      <div className="mt-5 space-y-2">
        <Link href="/acompanhar" className="btn-primario w-full">
          Digitar o código de novo
        </Link>
        <Link href="/" className="btn-secundario w-full">
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
