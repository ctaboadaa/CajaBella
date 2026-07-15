import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CaretLeft, CaretRight, Sparkle, TrendUp } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import type { DashboardData } from '../api/types';
import { useCountUp } from '../hooks/useCountUp';
import { formatMonto, formatFechaCorta, formatMesLargo, hoyISO, sumarDias } from '../lib/format';

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; datos: DashboardData };

export function Resumen() {
  const { token } = useAuth();
  const [fecha, setFecha] = useState(hoyISO());
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  useEffect(() => {
    let cancelado = false;
    setEstado({ tipo: 'cargando' });
    api
      .get<{ ok: true } & DashboardData>('dashboard', { token: token ?? undefined, fecha })
      .then((datos) => {
        if (!cancelado) setEstado({ tipo: 'listo', datos });
      })
      .catch((err) => {
        if (!cancelado) setEstado({ tipo: 'error', mensaje: err instanceof Error ? err.message : 'No pudimos cargar el resumen.' });
      });
    return () => {
      cancelado = true;
    };
  }, [token, fecha]);

  const esHoy = fecha === hoyISO();
  const totalMes = useCountUp(estado.tipo === 'listo' ? estado.datos.totalMes : 0);
  const totalDia = useCountUp(estado.tipo === 'listo' ? estado.datos.totalDia : 0);

  return (
    <div className="min-h-dvh bg-bg px-5 pb-6 pt-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto max-w-sm">
        <h1 className="mb-5 text-3xl text-ink">Resumen</h1>

        {estado.tipo === 'error' && (
          <div className="rounded-card border border-line bg-error-soft p-5 text-center text-sm text-error">{estado.mensaje}</div>
        )}

        {estado.tipo !== 'error' && (
          <div className="flex flex-col gap-4">
            {/* Hero: total acumulado */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="rounded-card border border-line bg-surface p-6"
            >
              <div className="mb-1 flex items-center gap-2 text-sm text-ink-soft">
                <Sparkle size={16} className="text-gold" weight="fill" />
                Total del mes
              </div>
              {estado.tipo === 'cargando' ? (
                <div className="h-11 w-40 animate-pulse rounded-control bg-surface-elevated" />
              ) : (
                <p className="text-4xl text-accent" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMonto(totalMes)}
                </p>
              )}
              <p className="mt-1 text-xs text-ink-faint">{estado.tipo === 'listo' ? formatMesLargo(estado.datos.mes) : ' '}</p>
            </motion.div>

            {/* Día con navegación */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-card border border-line bg-surface p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <button
                  aria-label="Día anterior"
                  onClick={() => setFecha((f) => sumarDias(f, -1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft active:scale-[0.95]"
                >
                  <CaretLeft size={16} />
                </button>
                <span className="text-sm font-medium text-ink">{esHoy ? 'Hoy' : formatFechaCorta(fecha)}</span>
                <button
                  aria-label="Día siguiente"
                  onClick={() => setFecha((f) => sumarDias(f, 1))}
                  disabled={esHoy}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-opacity active:scale-[0.95] disabled:opacity-30"
                >
                  <CaretRight size={16} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={fecha}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-end justify-between"
                >
                  <div>
                    <p className="text-xs text-ink-faint">Facturado</p>
                    {estado.tipo === 'cargando' ? (
                      <div className="mt-1 h-8 w-24 animate-pulse rounded-control bg-surface-elevated" />
                    ) : (
                      <p className="text-2xl text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatMonto(totalDia)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-faint">Servicios</p>
                    <p className="text-2xl text-ink">{estado.tipo === 'listo' ? estado.datos.cantidadDia : '–'}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Top servicios */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="rounded-card border border-line bg-surface p-6"
            >
              <div className="mb-3 flex items-center gap-2 text-sm text-ink-soft">
                <TrendUp size={16} className="text-accent" />
                Lo que más piden
              </div>

              {estado.tipo === 'cargando' && (
                <div className="flex flex-col gap-2">
                  <div className="h-10 animate-pulse rounded-control bg-surface-elevated" />
                  <div className="h-10 animate-pulse rounded-control bg-surface-elevated" />
                </div>
              )}

              {estado.tipo === 'listo' && estado.datos.topServicios.length === 0 && (
                <p className="text-sm text-ink-faint">
                  Todavía no hay servicios registrados.{' '}
                  <Link to="/registrar" className="font-medium text-accent underline underline-offset-2">
                    Registra el primero
                  </Link>
                  .
                </p>
              )}

              {estado.tipo === 'listo' && estado.datos.topServicios.length > 0 && (
                <ol className="flex flex-col gap-3">
                  {estado.datos.topServicios.map((s, i) => {
                    const max = estado.datos.topServicios[0].cantidad;
                    return (
                      <li key={s.nombre}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 font-medium text-ink">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-soft text-[11px] font-semibold text-gold">
                              {i + 1}
                            </span>
                            {s.nombre}
                          </span>
                          <span className="text-ink-soft">{s.cantidad}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(s.cantidad / max) * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 + i * 0.06 }}
                            className="h-full rounded-full bg-accent"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
