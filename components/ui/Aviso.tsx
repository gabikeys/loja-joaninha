type Props = {
  tipo?: "sucesso" | "erro" | "info";
  children: React.ReactNode;
};

const ESTILOS = {
  sucesso: "border-emerald-200 bg-emerald-50 text-emerald-900",
  erro: "border-red-200 bg-red-50 text-red-900",
  info: "border-agua-100 bg-agua-50 text-agua-700",
};

const ICONES = { sucesso: "✅", erro: "⚠️", info: "💡" };

/** Faixa de recado no topo da tela: "produto salvo", "deu erro", etc. */
export function Aviso({ tipo = "info", children }: Props) {
  return (
    <p
      role={tipo === "erro" ? "alert" : "status"}
      className={`mb-4 flex items-start gap-2 rounded-xl border p-3 font-medium ${ESTILOS[tipo]}`}
    >
      <span aria-hidden="true">{ICONES[tipo]}</span>
      <span>{children}</span>
    </p>
  );
}
