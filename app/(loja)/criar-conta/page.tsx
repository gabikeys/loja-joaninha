"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { traduzirErroAuth } from "@/lib/erros-auth";
import { mascaraTelefone } from "@/lib/mascaras";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function FormularioCriarConta() {
  const router = useRouter();
  const params = useSearchParams();
  const proximo = params.get("proximo") || "/minha-conta";

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [confirmarEmail, setConfirmarEmail] = useState(false);

  function validar(): boolean {
    const e: Record<string, string> = {};
    if (nome.trim().length < 2) e.nome = "Escreva seu nome.";
    const digitos = telefone.replace(/\D/g, "");
    if (digitos.length !== 10 && digitos.length !== 11)
      e.telefone = "Digite o WhatsApp com DDD. Exemplo: (11) 98765-4321";
    if (!email.includes("@")) e.email = "Esse e-mail não parece válido.";
    if (senha.length < 8) e.senha = "A senha precisa ter pelo menos 8 caracteres.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function criar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroGeral("");
    if (!validar()) return;

    setSalvando(true);
    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        setErroGeral(traduzirErroAuth(error.message));
        return;
      }

      // Se a loja exige confirmar o e-mail, ainda não existe sessão.
      if (!data.session) {
        setConfirmarEmail(true);
        return;
      }

      // Já entrou: guarda nome e telefone no perfil para o checkout vir pronto.
      await supabase
        .from("profiles")
        .update({ full_name: nome.trim(), phone: telefone.replace(/\D/g, "") })
        .eq("id", data.user!.id);

      router.push(proximo);
      router.refresh();
    } catch {
      setErroGeral("Sem conexão. Verifique sua internet e tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  if (confirmarEmail) {
    return (
      <div className="cartao p-6 text-center">
        <p className="text-4xl">📬</p>
        <h2 className="mt-3 text-lg font-bold text-slate-900">Confirme seu e-mail</h2>
        <p className="mt-2 text-slate-600">
          Enviamos uma mensagem para <strong>{email}</strong>. Abra o link de lá para ativar
          sua conta — dê uma olhada no spam se não achar.
        </p>
        <Link href="/entrar" className="btn-primario mt-5 w-full">
          Já confirmei, quero entrar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={criar} noValidate className="cartao space-y-4 p-5">
      {erroGeral && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
          {erroGeral}
        </p>
      )}

      <Campo id="nome" label="Seu nome" obrigatorio erro={erros.nome}>
        <input
          id="nome"
          className={`campo ${erros.nome ? "campo-erro" : ""}`}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          autoComplete="name"
          placeholder="Maria da Silva"
        />
      </Campo>

      <Campo
        id="telefone"
        label="WhatsApp"
        obrigatorio
        erro={erros.telefone}
        ajuda="É por aqui que a loja fala com você sobre a entrega."
      >
        <input
          id="telefone"
          className={`campo ${erros.telefone ? "campo-erro" : ""}`}
          value={telefone}
          onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
          inputMode="numeric"
          autoComplete="tel"
          placeholder="(11) 98765-4321"
        />
      </Campo>

      <Campo id="email" label="Seu e-mail" obrigatorio erro={erros.email}>
        <input
          id="email"
          type="email"
          className={`campo ${erros.email ? "campo-erro" : ""}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="maria@email.com"
        />
      </Campo>

      <Campo
        id="senha"
        label="Crie uma senha"
        obrigatorio
        erro={erros.senha}
        ajuda="Pelo menos 8 caracteres."
      >
        <input
          id="senha"
          type="password"
          className={`campo ${erros.senha ? "campo-erro" : ""}`}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="new-password"
        />
      </Campo>

      <button type="submit" disabled={salvando} className="btn-primario w-full">
        {salvando ? "Criando sua conta..." : "Criar minha conta"}
      </button>
    </form>
  );
}

export default function PaginaCriarConta() {
  return (
    <div className="mx-auto max-w-md">
      <div className="mb-5 text-center">
        <h1 className="text-xl font-bold text-slate-900">Criar conta</h1>
        <p className="text-sm text-slate-500">
          Assim seus pedidos ficam guardados e o endereço já vem preenchido.
        </p>
      </div>

      <Suspense fallback={<div className="cartao h-96 animate-pulse" />}>
        <FormularioCriarConta />
      </Suspense>

      <div className="mt-5 space-y-3 text-center">
        <p className="text-slate-600">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-semibold text-marca-700 underline">
            Entrar
          </Link>
        </p>
        <p className="rounded-xl bg-agua-50 p-3 text-sm text-agua-700">
          Criar conta é <strong>opcional</strong>. Se preferir, faça o pedido sem conta —
          é só escolher os produtos e preencher o endereço.
        </p>
        <Link href="/" className="btn-secundario w-full">
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
