const moneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const fechaCorta = new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });

export function formatMonto(valor: number): string {
  return moneda.format(valor);
}

export function hoyISO(): string {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset();
  return new Date(ahora.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function formatFechaCorta(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const texto = fechaCorta.format(new Date(y, m - 1, d));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function sumarDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  fecha.setDate(fecha.getDate() + dias);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}
