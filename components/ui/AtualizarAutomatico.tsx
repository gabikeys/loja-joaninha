"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Recarrega os dados da página de tempos em tempos, para o cliente ver o
 * status mudar sem precisar apertar nada.
 */
export function AtualizarAutomatico({ segundos = 45 }: { segundos?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, segundos * 1000);
    return () => clearInterval(id);
  }, [router, segundos]);

  return null;
}
