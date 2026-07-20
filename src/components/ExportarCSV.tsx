import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, DownloadSimple } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import type { Servicio } from '../api/types';
import { CampoFecha } from './CampoFecha';
import { serviciosACSV, descargarArchivo } from '../lib/csv';
import { hoyISO } from '../lib/format';

function primerDiaDelMes(iso: string): string {
  return iso.slice(0, 7) + '-01';
}

interface Props {
  fechaReferencia: string;
}

export function ExportarCSV({ fechaReferencia }: Props) {
  const { token } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [desde, setDesde] = useState(() => primerDiaDelMes(fechaReferencia));
  const [hasta, setHasta] = useState(() => hoyISO());
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<number | null>(null);

  async function onExportar() {
    setExportando(true);
    setError(null);
    setExito(null);
    try {
      const r = await api.get<{ ok: true; servicios: Servicio[] }>('servicios', { token: token ?? undefined, desde, hasta });
      if (r.servicios.length === 0) {
        setError('No hay servicios registrados en ese rango de fechas.');
        return;
      }
      const csv = serviciosACSV(r.servicios);
      descargarArchivo(`cajabella_servicios_${desde}_a_${hasta}.csv`, csv);
      setExito(r.servicios.length);
      setTimeout(() => setExito(null), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos exportar los servicios.');
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="mb-4 rounded-card border border-line bg-surface p-4">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-medium text-ink"
      >
        <span className="flex items-center gap-2">
          <DownloadSimple size={18} className="text-ink-faint" />
          Exportar a Excel/CSV
        </span>
        <span className="text-xs text-ink-faint">{abierto ? 'Ocultar' : 'Elegir rango'}</span>
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
              <div>
                <p className="mb-1 text-xs font-medium text-ink-soft">Desde</p>
                <CampoFecha value={desde} onChange={setDesde} max={hasta} label="Desde qué fecha exportar" />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-ink-soft">Hasta</p>
                <CampoFecha value={hasta} onChange={setHasta} max={hoyISO()} min={desde} label="Hasta qué fecha exportar" />
              </div>

              {error && (
                <p role="alert" className="rounded-control bg-error-soft px-3 py-2 text-xs text-error">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={onExportar}
                disabled={exportando}
                className="mt-1 rounded-control bg-accent py-2.5 text-sm font-medium text-white transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {exportando ? 'Generando…' : 'Descargar CSV'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exito !== null && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="mt-2 flex items-center gap-1.5 text-xs text-success"
          >
            <CheckCircle size={14} weight="fill" />
            {exito} {exito === 1 ? 'servicio exportado' : 'servicios exportados'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
