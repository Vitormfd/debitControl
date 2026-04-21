export const CATEGORIAS = [
  { value: "Casa", label: "🏠 Casa" },
  { value: "Lanchonete", label: "🍽️ Lanchonete" },
  { value: "Carro", label: "🚗 Carro" },
  { value: "Cartão", label: "💳 Cartão" },
  { value: "Água", label: "💧 Água" },
  { value: "Telefone", label: "📱 Telefone" },
  { value: "Outro", label: "📋 Outro" },
] as const;

export function categoriaConhecida(cat: string): boolean {
  return CATEGORIAS.some((c) => c.value === cat);
}
