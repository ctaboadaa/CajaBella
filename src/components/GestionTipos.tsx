import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PencilSimple, Plus } from '@phosphor-icons/react';
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
  const [precioNuevo, setPrecioNuevo] = useState('');
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

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
      await api.post('crearTipoServicio', { token, nombre: nombreNuevo.trim(), montoSugerido: Number(precioNuevo) || undefined });
      setNombreNuevo('');
      setPrecioNuevo('');
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
                className="rounded-control border border-line px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className={`block truncate text-sm ${t.activo ? 'text-ink' : 'text-ink-faint line-through'}`}>{t.nombre}</span>
                    {Number(t.montoSugerido) > 0 && <span className="text-xs text-ink-faint">Sugerido: S/{Number(t.montoSugerido).toFixed(2)}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditandoId((actual) => (actual === t.id ? null : t.id))}
                    aria-label={`Editar ${t.nombre}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-faint active:scale-[0.95]"
                  >
                    <PencilSimple size={16} />
                  </button>
                  <Toggle activo={t.activo} onChange={(v) => onToggle(t.id, v)} label={`Activar o desactivar ${t.nombre}`} />
                </div>

                <AnimatePresence>{editandoId === t.id && <EditarTipo tipo={t} onListo={() => { setEditandoId(null); cargar(); }} />}</AnimatePresence>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <form onSubmit={onCrear} className="mt-3 flex flex-col gap-2">
        <input
          type="text"
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          placeholder="Nuevo tipo de servicio"
          className="min-w-0 rounded-control border border-line bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
        />
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">S/</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={precioNuevo}
              onChange={(e) => setPrecioNuevo(e.target.value)}
              placeholder="Precio sugerido (opcional)"
              className="w-full min-w-0 rounded-control border border-line bg-bg py-2.5 pl-8 pr-3 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={!nombreNuevo.trim() || creando}
            aria-label="Agregar tipo de servicio"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-accent text-white transition-all active:scale-[0.95] disabled:opacity-50"
          >
            <Plus size={18} weight="bold" />
          </button>
        </div>
      </form>
    </div>
  );
}

function EditarTipo({ tipo, onListo }: { tipo: TipoServicio; onListo: () => void }) {
  const { token } = useAuth();
  const [nombre, setNombre] = useState(tipo.nombre);
  const [precio, setPrecio] = useState(Number(tipo.montoSugerido) > 0 ? String(tipo.montoSugerido) : '');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      await api.post('actualizarTipoServicio', { token, id: tipo.id, nombre: nombre.trim(), montoSugerido: Number(precio) || 0 });
      onListo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar los cambios.');
      setEnviando(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onSubmit={onSubmit}
      className="mt-2 flex flex-col gap-2 overflow-hidden border-t border-line pt-2"
    >
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="min-w-0 rounded-control border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">S/</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.5"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Precio sugerido (opcional)"
          className="w-full min-w-0 rounded-control border border-line bg-bg py-2 pl-8 pr-3 text-sm text-ink outline-none focus:border-accent"
        />
      </div>
      {error && <p role="alert" className="rounded-control bg-error-soft px-3 py-2 text-xs text-error">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onListo} className="flex-1 rounded-control border border-line py-2 text-xs font-medium text-ink-soft">
          Cancelar
        </button>
        <button type="submit" disabled={enviando || !nombre.trim()} className="flex-1 rounded-control bg-accent py-2 text-xs font-medium text-white disabled:opacity-50">
          {enviando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </motion.form>
  );
}
