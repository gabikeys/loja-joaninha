"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  /** Para onde ir depois de sair. */
  destino?: string;
  rotulo?: string;
  className?: string;
};

export function BotaoSair({
  destino = "/admin/login",
  rotulo = "Sair",
  className = "btn-secundario btn-sm",
}: Props) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(destino);
    router.refresh();
  }

  return (
    <button type="button" onClick={sair} disabled={saindo} className={className}>
      {saindo ? "Saindo..." : rotulo}
    </button>
  );
}
