export function formatCurrency(amount: number) {
  const formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
  });
  return formatter.format(amount);
}