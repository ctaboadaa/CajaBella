import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import type { Servicio, TipoServicio } from '../api/types';
import { SelectorDeFecha } from '../components/SelectorDeFecha';
import { ServicioItem } from '../components/ServicioItem';
import { ExportarCSV } from '../components/ExportarCSV';
import { formatMonto, hoyISO } from '../lib/format';

type Estado = { tipo: 'cargando' } | { tipo: 'error'; mensaje: string } | { tipo: 'listo' };

export function Historial() {
  const { token, usuario } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const fecha = searchParams.get('fecha') || hoyISO();

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [tipos, setTipos] = useState<TipoServicio[]>([]);
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  function cargar() {
    setEstado({ tipo: 'cargando' });
    Promise.all([
      api.get<{ ok: true; servicios: Servicio[] }>('servicios', { token: token ?? undefined, desde: fecha, hasta: fecha }),
      api.get<{ ok: true; tipos: TipoServicio[] }>('tiposServicio', { token: token ?? undefined }),
    ])
      .then(([resServicios, resTipos]) => {
        setServicios(resServicios.servicios);
        setTipos(resTipos.tipos);
        setEstado({ tipo: 'listo' });
      })
      .catch((err) => setEstado({ tipo: 'error', mensaje: err instanceof Error ? err.message : 'No pudimos cargar el historial.' }));
  }

  useEffect(cargar, [token, fecha]);

  function onCambiarFecha(nuevaFecha: string) {
    setSearchParams({ fecha: nuevaFecha });
  }

  const totalDia = servicios.reduce((suma, s) => suma + s.monto, 0);

  return (
    <div className="min-h-dvh bg-bg px-5 pb-6 pt-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto max-w-sm">
        <h1 className="mb-5 text-3xl text-ink">Historial</h1>

        <div className="mb-4 rounded-card border border-line bg-surface p-4">
          <SelectorDeFecha fecha={fecha} onCambiarFecha={onCambiarFecha} />
        </div>

        <ExportarCSV fechaReferencia={fecha} />

        {estado.tipo === 'error' && (
          <div className="rounded-card border border-line bg-error-soft p-5 text-center text-sm text-error">{estado.mensaje}</div>
        )}

        {estado.tipo === 'cargando' && (
          <div className="flex flex-col gap-3">
            <div className="h-24 animate-pulse rounded-card bg-surface-elevated" />
            <div className="h-24 animate-pulse rounded-card bg-surface-elevated" />
          </div>
        )}

        {estado.tipo === 'listo' && (
          <>
            {servicios.length > 0 && (
              <p className="mb-3 text-sm text-ink-soft">
                {servicios.length} {servicios.length === 1 ? 'servicio' : 'servicios'} · <span className="font-medium text-ink">{formatMonto(totalDia)}</span>
              </p>
            )}

            {servicios.length === 0 && (
              <div className="rounded-card border border-line bg-surface p-6 text-center">
                <p className="text-sm text-ink-soft">No hay servicios registrados este día.</p>
                <Link to="/registrar" className="mt-2 inline-block text-sm font-medium text-accent underline underline-offset-2">
                  Registrar un servicio
                </Link>
              </div>
            )}

            <ul className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {servicios.map((s) => (
                  <motion.li key={s.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <ServicioItem
                      servicio={s}
                      tipos={tipos}
                      puedeEditar={s.usuarioId === usuario?.id || usuario?.rol === 'admin'}
                      onCambiado={cargar}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}
      </motion.div>
    </div>
  );
}
