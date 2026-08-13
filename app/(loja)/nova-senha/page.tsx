"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Tela aberta pelo link de "esqueci minha senha" que chega no e-mail. */
export default function PaginaNovaSenhaCliente() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function preparar() {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) setErro("Esse link expirou. Peça um novo em 'Esqueci minha senha'.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) setErro("Abra esta página pelo link que chegou no seu e-mail.");
    }

    preparar();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As duas senhas estão diferentes. Confira e tente de novo.");
      return;
    }

    setSalvando(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) {
        setErro("Não conseguimos trocar a senha. Peça um novo link e tente de novo.");
        return;
      }
      setSucesso(true);
      setTimeout(() => {
        router.push("/minha-conta");
        router.refresh();
      }, 1500);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-center text-xl font-bold text-slate-900">Criar nova senha</h1>

      {sucesso ? (
        <div className="cartao p-6 text-center">
          <p className="text-4xl">✅</p>
          <p className="mt-2 font-semibold text-slate-800">Senha alterada!</p>
          <p className="text-slate-600">Já vamos te levar para a sua conta.</p>
        </div>
      ) : (
        <form onSubmit={salvar} className="cartao space-y-4 p-5">
          {erro && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
              {erro}
            </p>
          )}

          <Campo id="senha" label="Nova senha" obrigatorio ajuda="Pelo menos 8 caracteres.">
            <input
              id="senha"
              type="password"
              className="campo"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
              required
            />
          </Campo>

          <Campo id="confirmar" label="Repita a nova senha" obrigatorio>
            <input
              id="confirmar"
              type="password"
              className="campo"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              autoComplete="new-password"
              required
            />
          </Campo>

          <button type="submit" disabled={salvando} className="btn-primario w-full">
            {salvando ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      )}
    </div>
  );
}
