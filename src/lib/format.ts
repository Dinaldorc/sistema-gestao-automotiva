export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}

export function diasDesde(iso: string): number {
  const inicio = new Date(`${iso}T00:00:00`).getTime();
  return Math.max(0, Math.floor((Date.now() - inicio) / 86_400_000));
}
