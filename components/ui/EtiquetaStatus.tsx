import { STATUS_LABEL } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const CORES: Record<OrderStatus, string> = {
  aguardando: "bg-amber-100 text-amber-800",
  aceito: "bg-agua-100 text-agua-700",
  em_preparo: "bg-agua-100 text-agua-700",
  saiu_entrega: "bg-indigo-100 text-indigo-800",
  entregue: "bg-emerald-100 text-emerald-800",
  recusado: "bg-slate-200 text-slate-700",
  cancelado: "bg-slate-200 text-slate-700",
};

export function EtiquetaStatus({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${CORES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
