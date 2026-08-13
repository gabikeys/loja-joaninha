"use client";

import { useState } from "react";

type Props = {
  texto: string;
  rotulo?: string;
  className?: string;
};

/** Copia um texto e confirma na tela — usado no código do pedido e no endereço. */
export function BotaoCopiar({ texto, rotulo = "Copiar", className = "" }: Props) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // Navegadores antigos / http sem permissão: usa o caminho manual.
      const area = document.createElement("textarea");
      area.value = texto;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch {
        window.prompt("Copie o texto abaixo:", texto);
        document.body.removeChild(area);
        return;
      }
      document.body.removeChild(area);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button type="button" onClick={copiar} className={className || "btn-secundario btn-sm"}>
      {copiado ? "✓ Copiado!" : rotulo}
    </button>
  );
}
