/** Máscaras de digitação usadas nos formulários. */

export function mascaraTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function mascaraCep(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 8);
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
}

/** Digitação de dinheiro: a pessoa digita só números e vira "12,90". */
export function mascaraDinheiro(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 9);
  if (!d) return "";
  const centavos = d.padStart(3, "0");
  const inteiros = centavos.slice(0, -2).replace(/^0+(?=\d)/, "");
  return `${Number(inteiros).toLocaleString("pt-BR")},${centavos.slice(-2)}`;
}

/** "12,90" -> 1290 centavos. Aceita vazio (null). */
export function dinheiroParaCentavos(valor: string): number | null {
  const d = valor.replace(/\D/g, "");
  if (!d) return null;
  return Number(d);
}
