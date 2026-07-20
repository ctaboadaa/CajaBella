import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChartLineUp } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import type { Servicio } from '../api/types';
import { formatDiaSemanaCorta, formatMonto, hoyISO, sumarDias } from '../lib/format';

type Dia = { fecha: string; monto: number };
type Estado = { tipo: 'cargando' } | { tipo: 'error' } | { tipo: 'listo'; dias: Dia[] };

export function TendenciaSemana() {
  const { token } = useAuth();
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  useEffect(() => {
    let cancelado = false;
    const hoy = hoyISO();
    const desde = sumarDias(hoy, -6);
    setEstado({ tipo: 'cargando' });
    api
      .get<{ ok: true; servicios: Servicio[] }>('servicios', { token: token ?? undefined, desde, hasta: hoy })
      .then((r) => {
        if (cancelado) return;
        const montoPorFecha: Record<string, number> = {};
        r.servicios.forEach((s) => {
          montoPorFecha[s.fecha] = (montoPorFecha[s.fecha] || 0) + s.monto;
        });
        const dias = Array.from({ length: 7 }, (_, i) => {
          const fecha = sumarDias(hoy, -6 + i);
          return { fecha, monto: montoPorFecha[fecha] || 0 };
        });
        setEstado({ tipo: 'listo', dias });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: 'error' });
      });
    return () => {
      cancelado = true;
    };
  }, [token]);

  // Si falla, se oculta en silencio — no vale la pena bloquear el resto del dashboard por esto.
  if (estado.tipo === 'error') return null;

  const hoy = hoyISO();
  const dias = estado.tipo === 'listo' ? estado.dias : [];
  const max = Math.max(...dias.map((d) => d.monto), 1);

  return (
    <div className="rounded-card border border-line bg-surface p-6">
      <div className="mb-4 flex items-center gap-2 text-sm text-ink-soft">
        <ChartLineUp size={16} className="text-accent" />
        Últimos 7 días
      </div>

      {estado.tipo === 'cargando' ? (
        <div className="h-24 animate-pulse rounded-control bg-surface-elevated" />
      ) : (
        <>
          <table className="sr-only">
            <caption>Monto facturado por día en los últimos 7 días</caption>
            <tbody>
              {dias.map((d) => (
                <tr key={d.fecha}>
                  <td>{d.fecha}</td>
                  <td>{formatMonto(d.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div aria-hidden className="flex items-end justify-between gap-2">
            {dias.map((d, i) => (
              <div key={d.fecha} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-20 w-full items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((d.monto / max) * 100, d.monto > 0 ? 6 : 2)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.05 }}
                    className={`w-full rounded-t-md ${d.fecha === hoy ? 'bg-accent' : 'bg-accent-soft'}`}
                  />
                </div>
                <span className={`text-[11px] ${d.fecha === hoy ? 'font-medium text-ink' : 'text-ink-faint'}`}>{formatDiaSemanaCorta(d.fecha)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
