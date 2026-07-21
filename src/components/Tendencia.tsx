import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChartLineUp } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import type { Servicio } from '../api/types';
import { formatDiaSemanaCorta, formatMesCorto, formatMonto, hoyISO, mesRelativo, sumarDias } from '../lib/format';

type Barra = { clave: string; etiqueta: string; monto: number; esActual: boolean };
type Modo = 'dias' | 'meses';
type Estado = { tipo: 'cargando' } | { tipo: 'error' } | { tipo: 'listo'; barras: Barra[] };

function cargarDias(token: string | null): Promise<Barra[]> {
  const hoy = hoyISO();
  const desde = sumarDias(hoy, -6);
  return api.get<{ ok: true; servicios: Servicio[] }>('servicios', { token: token ?? undefined, desde, hasta: hoy }).then((r) => {
    const montoPorFecha: Record<string, number> = {};
    r.servicios.forEach((s) => {
      montoPorFecha[s.fecha] = (montoPorFecha[s.fecha] || 0) + s.monto;
    });
    return Array.from({ length: 7 }, (_, i) => {
      const fecha = sumarDias(hoy, -6 + i);
      return { clave: fecha, etiqueta: formatDiaSemanaCorta(fecha), monto: montoPorFecha[fecha] || 0, esActual: fecha === hoy };
    });
  });
}

function cargarMeses(token: string | null): Promise<Barra[]> {
  const mesActual = mesRelativo(0);
  const desde = mesRelativo(5) + '-01';
  return api.get<{ ok: true; servicios: Servicio[] }>('servicios', { token: token ?? undefined, desde, hasta: hoyISO() }).then((r) => {
    const montoPorMes: Record<string, number> = {};
    r.servicios.forEach((s) => {
      const mes = s.fecha.slice(0, 7);
      montoPorMes[mes] = (montoPorMes[mes] || 0) + s.monto;
    });
    return Array.from({ length: 6 }, (_, i) => {
      const mes = mesRelativo(5 - i);
      return { clave: mes, etiqueta: formatMesCorto(mes), monto: montoPorMes[mes] || 0, esActual: mes === mesActual };
    });
  });
}

export function Tendencia() {
  const { token } = useAuth();
  const [modo, setModo] = useState<Modo>('dias');
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  useEffect(() => {
    let cancelado = false;
    setEstado({ tipo: 'cargando' });
    const cargar = modo === 'dias' ? cargarDias : cargarMeses;
    cargar(token)
      .then((barras) => {
        if (!cancelado) setEstado({ tipo: 'listo', barras });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: 'error' });
      });
    return () => {
      cancelado = true;
    };
  }, [token, modo]);

  if (estado.tipo === 'error') return null;

  const barras = estado.tipo === 'listo' ? estado.barras : [];
  const max = Math.max(...barras.map((b) => b.monto), 1);

  return (
    <div className="rounded-card border border-line bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <ChartLineUp size={16} className="text-accent" />
          Tendencia
        </div>
        <div className="flex gap-1 rounded-full bg-surface-elevated p-1">
          {(['dias', 'meses'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                modo === m ? 'bg-surface text-ink shadow-sm' : 'text-ink-faint'
              }`}
            >
              {m === 'dias' ? '7 días' : '6 meses'}
            </button>
          ))}
        </div>
      </div>

      {estado.tipo === 'cargando' ? (
        <div className="h-24 animate-pulse rounded-control bg-surface-elevated" />
      ) : (
        <>
          <table className="sr-only">
            <caption>Monto facturado por {modo === 'dias' ? 'día en los últimos 7 días' : 'mes en los últimos 6 meses'}</caption>
            <tbody>
              {barras.map((b) => (
                <tr key={b.clave}>
                  <td>{b.clave}</td>
                  <td>{formatMonto(b.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div aria-hidden className="flex items-end justify-between gap-2">
            {barras.map((b, i) => (
              <div key={b.clave} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-20 w-full items-end">
                  <motion.div
                    key={modo}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((b.monto / max) * 100, b.monto > 0 ? 6 : 2)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.05 }}
                    className={`w-full rounded-t-md ${b.esActual ? 'bg-accent' : 'bg-accent-soft'}`}
                  />
                </div>
                <span className={`text-[11px] ${b.esActual ? 'font-medium text-ink' : 'text-ink-faint'}`}>{b.etiqueta}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
