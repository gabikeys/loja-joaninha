/**
 * O Supabase devolve os erros de login em inglês e em linguagem técnica.
 * Aqui eles viram frases que qualquer pessoa entende.
 */
export function traduzirErroAuth(mensagem: string): string {
  const m = mensagem.toLowerCase();

  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos. Tente de novo.";
  if (m.includes("email not confirmed"))
    return "Falta confirmar seu e-mail. Procure a mensagem que enviamos (veja também o spam).";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Já existe uma conta com esse e-mail. Tente entrar, ou use 'Esqueci minha senha'.";
  if (m.includes("password should be at least"))
    return "A senha precisa ter pelo menos 8 caracteres.";
  if (m.includes("weak password") || m.includes("password is too weak"))
    return "Essa senha é fácil demais. Misture letras e números.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Esse e-mail não parece válido. Confira se está escrito certo.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled"))
    return "O cadastro de novas contas está desligado no momento. Fale com a loja pelo WhatsApp.";
  if (m.includes("too many requests") || m.includes("rate limit") || m.includes("for security purposes"))
    return "Muitas tentativas seguidas. Espere um minutinho e tente de novo.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Sem conexão com a internet. Verifique e tente de novo.";

  return "Não conseguimos concluir agora. Tente novamente em instantes.";
}
