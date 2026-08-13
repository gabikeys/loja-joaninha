import { STATUS_FLOW, STATUS_LABEL, formatDateTimeShort } from "@/lib/format";
import type { OrderStatus, OrderStatusHistory } from "@/lib/types";

type Props = {
  statusAtual: OrderStatus;
  historico: OrderStatusHistory[];
};

/** Etapas do pedido, do "aguardando" até o "entregue". */
export function LinhaDoTempo({ statusAtual, historico }: Props) {
  const cancelado = statusAtual === "recusado" || statusAtual === "cancelado";

  if (cancelado) {
    const quando = historico.find((h) => h.to_status === statusAtual)?.created_at;
    return (
      <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
        <p className="font-bold text-slate-800">{STATUS_LABEL[statusAtual]}</p>
        {quando && (
          <p className="text-sm text-slate-500">{formatDateTimeShort(quando)}</p>
        )}
      </div>
    );
  }

  const indiceAtual = STATUS_FLOW.indexOf(statusAtual);

  return (
    <ol className="space-y-0">
      {STATUS_FLOW.map((status, i) => {
        const concluido = i <= indiceAtual;
        const atual = i === indiceAtual;
        const quando = historico.find((h) => h.to_status === status)?.created_at;
        const ultimo = i === STATUS_FLOW.length - 1;

        return (
          <li key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${
                  concluido
                    ? "border-marca-600 bg-marca-600 text-white"
                    : "border-slate-300 bg-white text-slate-300"
                }`}
              >
                {concluido ? "✓" : i + 1}
              </span>
              {!ultimo && (
                <span
                  aria-hidden="true"
                  className={`w-0.5 flex-1 ${i < indiceAtual ? "bg-marca-600" : "bg-slate-200"}`}
                />
              )}
            </div>

            <div className={`pb-6 ${ultimo ? "pb-0" : ""}`}>
              <p
                className={`font-semibold ${
                  atual ? "text-marca-700" : concluido ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {STATUS_LABEL[status]}
                {atual && (
                  <span className="ml-2 rounded-full bg-marca-100 px-2 py-0.5 text-xs text-marca-700">
                    agora
                  </span>
                )}
              </p>
              {quando && <p className="text-sm text-slate-500">{formatDateTimeShort(quando)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
