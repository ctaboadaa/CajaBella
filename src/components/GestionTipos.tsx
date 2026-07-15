import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import type { TipoServicio } from '../api/types';
import { Toggle } from './Toggle';

type Estado = { tipo: 'cargando' } | { tipo: 'error'; mensaje: string } | { tipo: 'listo' };

export function GestionTipos() {
  const { token } = useAuth();
  const [tipos, setTipos] = useState<TipoServicio[]>([]);
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [creando, setCreando] = useState(false);

  function cargar() {
    setEstado({ tipo: 'cargando' });
    api
      .get<{ ok: true; tipos: TipoServicio[] }>('tiposServicioTodos', { token: token ?? undefined })
      .then((r) => {
        setTipos(r.tipos);
        setEstado({ tipo: 'listo' });
      })
      .catch((err) => setEstado({ tipo: 'error', mensaje: err instanceof Error ? err.message : 'No pudimos cargar los tipos de servicio.' }));
  }

  useEffect(cargar, [token]);

  async function onCrear(e: FormEvent) {
    e.preventDefault();
    if (!nombreNuevo.trim() || creando) return;
    setCreando(true);
    try {
      await api.post('crearTipoServicio', { token, nombre: nombreNuevo.trim() });
      setNombreNuevo('');
      cargar();
    } catch {
      // el estado de error general de la lista ya cubre este caso al recargar
    } finally {
      setCreando(false);
    }
  }

  async function onToggle(id: string, activo: boolean) {
    setTipos((prev) => prev.map((t) => (t.id === id ? { ...t, activo } : t)));
    try {
      await api.post('actualizarTipoServicio', { token, id, activo });
    } catch {
      cargar();
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-ink">Tipos de servicio</h2>

      {estado.tipo === 'cargando' && (
        <div className="flex flex-col gap-2">
          <div className="h-10 animate-pulse rounded-control bg-surface-elevated" />
          <div className="h-10 animate-pulse rounded-control bg-surface-elevated" />
        </div>
      )}

      {estado.tipo === 'error' && (
        <div className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
          {estado.mensaje}{' '}
          <button type="button" onClick={cargar} className="font-medium underline underline-offset-2">
            Reintentar
          </button>
        </div>
      )}

      {estado.tipo === 'listo' && (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {tipos.map((t) => (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2.5"
              >
                <span className={`text-sm ${t.activo ? 'text-ink' : 'text-ink-faint line-through'}`}>{t.nombre}</span>
                <Toggle activo={t.activo} onChange={(v) => onToggle(t.id, v)} label={`Activar o desactivar ${t.nombre}`} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <form onSubmit={onCrear} className="mt-3 flex gap-2">
        <input
          type="text"
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          placeholder="Nuevo tipo de servicio"
          className="min-w-0 flex-1 rounded-control border border-line bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={!nombreNuevo.trim() || creando}
          aria-label="Agregar tipo de servicio"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-accent text-white transition-all active:scale-[0.95] disabled:opacity-50"
        >
          <Plus size={18} weight="bold" />
        </button>
      </form>
    </div>
  );
}
