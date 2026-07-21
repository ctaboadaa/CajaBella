const moneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const fechaCorta = new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
const mesLargo = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' });
const fechaLarga = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
const diaSemanaCorta = new Intl.DateTimeFormat('es-PE', { weekday: 'short' });
const mesCorto = new Intl.DateTimeFormat('es-PE', { month: 'short' });

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

export function formatFechaLarga(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const texto = fechaLarga.format(new Date(y, m - 1, d));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatDiaSemanaCorta(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const texto = diaSemanaCorta.format(new Date(y, m - 1, d));
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace('.', '');
}

export function formatMesLargo(mesISO: string): string {
  const [y, m] = mesISO.split('-').map(Number);
  const texto = mesLargo.format(new Date(y, m - 1, 1));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatMesCorto(mesISO: string): string {
  const [y, m] = mesISO.split('-').map(Number);
  const texto = mesCorto.format(new Date(y, m - 1, 1));
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace('.', '');
}

// "YYYY-MM" del mes actual menos `n` meses (0 = mes actual, 1 = el anterior, etc.)
export function mesRelativo(n: number): string {
  const hoy = new Date();
  const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - n, 1);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
}

export function sumarDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  fecha.setDate(fecha.getDate() + dias);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}
