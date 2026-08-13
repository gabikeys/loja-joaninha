"use client";

import { useFormStatus } from "react-dom";

type FormProps = {
  action: (formData: FormData) => void | Promise<void>;
  confirmar?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Formulário de ação única (excluir, duplicar, mover...).
 * Se receber "confirmar", pergunta antes — evita apagar produto sem querer.
 */
export function FormAcao({ action, confirmar, className, children }: FormProps) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}

type BotaoProps = {
  children: React.ReactNode;
  ocupado?: React.ReactNode;
  className?: string;
  title?: string;
  "aria-label"?: string;
};

/** Botão que mostra sozinho que está trabalhando. */
export function BotaoSubmit({
  children,
  ocupado = "Salvando...",
  className = "btn-primario",
  ...resto
}: BotaoProps) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} {...resto}>
      {pending ? ocupado : children}
    </button>
  );
}
