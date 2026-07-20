import type { Servicio } from '../api/types';

function celda(valor: string): string {
  // Los nombres de cliente los escribe cualquier empleado — si alguien escribe algo que
  // empieza con = + - @ (sin querer o no), Excel/Sheets podría intentar leerlo como una
  // fórmula al abrir el archivo. Se antepone una comilla para que quede como texto plano.
  let v = /^[=+\-@]/.test(valor) ? "'" + valor : valor;
  if (/[",\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
  return v;
}

export function serviciosACSV(servicios: Servicio[]): string {
  const encabezados = ['Fecha', 'Tipo de servicio', 'Monto (S/)', 'Cliente', 'Teléfono', 'Registrado por'];
  const ordenados = [...servicios].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.creadoEn.localeCompare(b.creadoEn));
  const filas = ordenados.map((s) => [s.fecha, s.tipoNombre, s.monto.toFixed(2), s.clienteNombre, s.clienteTelefono, s.usuarioNombre]);
  const lineas = [encabezados, ...filas].map((fila) => fila.map(celda).join(','));
  const BOM = '﻿'; // para que Excel reconozca los acentos (áéíóñ) como UTF-8 y no los rompa
  return BOM + lineas.join('\r\n');
}

export function descargarArchivo(nombre: string, contenidoCSV: string): void {
  const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombre;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
