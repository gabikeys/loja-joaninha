"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Traduz os erros do Supabase para algo que faça sentido para ela. */
function traduzirErro(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos. Tente de novo.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail pelo link que enviamos.";
  if (m.includes("too many requests") || m.includes("rate limit"))
    return "Muitas tentativas seguidas. Espere um minutinho e tente de novo.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Sem conexão com a internet. Verifique e tente de novo.";
  return "Não conseguimos entrar agora. Tente novamente em instantes.";
}

function FormularioLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const proximo = params.get("proximo") || "/admin/pedidos";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [recuperando, setRecuperando] = useState(false);
  const [aviso, setAviso] = useState("");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setAviso("");
    setEntrando(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        setErro(traduzirErro(error.message));
        return;
      }

      router.push(proximo);
      router.refresh();
    } catch {
      setErro("Não conseguimos entrar agora. Verifique sua internet.");
    } finally {
      setEntrando(false);
    }
  }

  async function recuperarSenha() {
    if (!email.trim()) {
      setErro("Escreva seu e-mail acima para receber o link de nova senha.");
      return;
    }
    setErro("");
    setRecuperando(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/nova-senha`,
      });
      setAviso(
        "Pronto! Se esse e-mail estiver cadastrado, você vai receber um link para criar uma nova senha."
      );
    } catch {
      setErro("Não conseguimos enviar o e-mail agora. Tente novamente.");
    } finally {
      setRecuperando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="cartao space-y-4 p-6">
      {erro && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
          {erro}
        </p>
      )}
      {aviso && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
          {aviso}
        </p>
      )}

      <Campo id="email" label="Seu e-mail" obrigatorio>
        <input
          id="email"
          type="email"
          className="campo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          placeholder="joaninha@email.com"
          required
        />
      </Campo>

      <Campo id="senha" label="Sua senha" obrigatorio>
        <input
          id="senha"
          type="password"
          className="campo"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </Campo>

      <button type="submit" disabled={entrando} className="btn-primario w-full">
        {entrando ? "Entrando..." : "Entrar no painel"}
      </button>

      <button
        type="button"
        onClick={recuperarSenha}
        disabled={recuperando}
        className="w-full text-sm font-semibold text-marca-700 underline disabled:opacity-50"
      >
        {recuperando ? "Enviando..." : "Esqueci minha senha"}
      </button>
    </form>
  );
}

export default function PaginaLogin() {
  return (
    <div className="mx-auto grid min-h-dvh max-w-md place-items-center p-5">
      <div className="w-full">
        <div className="mb-6 text-center">
          <p className="text-5xl">🐞</p>
          <h1 className="mt-2 text-xl font-bold text-slate-900">Painel da Joaninha</h1>
          <p className="text-slate-500">Entre para cuidar dos seus produtos e pedidos.</p>
        </div>

        <Suspense fallback={<div className="cartao h-80 animate-pulse" />}>
          <FormularioLogin />
        </Suspense>

        <p className="mt-5 text-center">
          <Link href="/" className="text-sm text-slate-500 underline">
            Ver a loja
          </Link>
        </p>
      </div>
    </div>
  );
}
