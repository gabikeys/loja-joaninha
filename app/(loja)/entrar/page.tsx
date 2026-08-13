"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { traduzirErroAuth } from "@/lib/erros-auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function FormularioEntrar() {
  const router = useRouter();
  const params = useSearchParams();
  const proximo = params.get("proximo") || "/minha-conta";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [recuperando, setRecuperando] = useState(false);

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
        setErro(traduzirErroAuth(error.message));
        return;
      }

      router.push(proximo);
      router.refresh();
    } catch {
      setErro("Sem conexão. Verifique sua internet e tente de novo.");
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
        redirectTo: `${window.location.origin}/nova-senha`,
      });
      setAviso(
        "Pronto! Se esse e-mail tiver conta, você vai receber um link para criar uma nova senha."
      );
    } catch {
      setErro("Não conseguimos enviar o e-mail agora. Tente novamente.");
    } finally {
      setRecuperando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="cartao space-y-4 p-5">
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
          placeholder="maria@email.com"
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
        {entrando ? "Entrando..." : "Entrar"}
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

export default function PaginaEntrar() {
  return (
    <div className="mx-auto max-w-md">
      <div className="mb-5 text-center">
        <h1 className="text-xl font-bold text-slate-900">Entrar na sua conta</h1>
        <p className="text-sm text-slate-500">
          Para ver seus pedidos e comprar mais rápido da próxima vez.
        </p>
      </div>

      <Suspense fallback={<div className="cartao h-72 animate-pulse" />}>
        <FormularioEntrar />
      </Suspense>

      <div className="mt-5 space-y-3 text-center">
        <p className="text-slate-600">
          Ainda não tem conta?{" "}
          <Link href="/criar-conta" className="font-semibold text-marca-700 underline">
            Criar conta
          </Link>
        </p>
        <p className="rounded-xl bg-agua-50 p-3 text-sm text-agua-700">
          Você <strong>não precisa</strong> de conta para comprar. Dá para fazer o pedido
          direto, só preenchendo o endereço.
        </p>
        <Link href="/" className="btn-secundario w-full">
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
