import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { CalendarBlank, PencilSimple, Trash } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import type { Servicio, TipoServicio } from '../api/types';
import { formatFechaLarga, formatMonto, hoyISO } from '../lib/format';

interface Props {
  servicio: Servicio;
  tipos: TipoServicio[];
  puedeEditar: boolean;
  onCambiado: () => void;
}

const horaCorta = new Intl.DateTimeFormat('es-PE', { hour: 'numeric', minute: '2-digit' });

export function ServicioItem({ servicio, tipos, puedeEditar, onCambiado }: Props) {
  const { token } = useAuth();
  const [modo, setModo] = useState<'ver' | 'editar' | 'confirmarEliminar'>('ver');
  const [fecha, setFecha] = useState(servicio.fecha);
  const [tipoServicioId, setTipoServicioId] = useState(servicio.tipoServicioId);
  const [monto, setMonto] = useState(String(servicio.monto));
  const [clienteNombre, setClienteNombre] = useState(servicio.clienteNombre);
  const [clienteTelefono, setClienteTelefono] = useState(servicio.clienteTelefono);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hora = horaCorta.format(new Date(servicio.creadoEn));
  const puedeGuardar = !!fecha && !!tipoServicioId && Number(monto) > 0 && !enviando;

  async function onGuardar(e: FormEvent) {
    e.preventDefault();
    if (!puedeGuardar) return;
    setEnviando(true);
    setError(null);
    try {
      await api.post('actualizarServicio', {
        token,
        id: servicio.id,
        fecha,
        tipoServicioId,
        monto: Number(monto),
        clienteNombre: clienteNombre.trim(),
        clienteTelefono: clienteTelefono.trim(),
      });
      onCambiado();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar los cambios.');
    } finally {
      setEnviando(false);
    }
  }

  async function onConfirmarEliminar() {
    setEnviando(true);
    setError(null);
    try {
      await api.post('eliminarServicio', { token, id: servicio.id });
      onCambiado();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos borrar el servicio.');
      setEnviando(false);
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-medium text-ink">{servicio.tipoNombre}</p>
          <p className="truncate text-xs text-ink-faint">
            {hora}
            {servicio.clienteNombre ? ` · ${servicio.clienteNombre}` : ''} · registrado por {servicio.usuarioNombre}
          </p>
        </div>
        <p className="shrink-0 text-lg font-medium text-accent" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatMonto(servicio.monto)}
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-2 rounded-control bg-error-soft px-3 py-2 text-xs text-error">
          {error}
        </p>
      )}

      {puedeEditar && modo === 'ver' && (
        <div className="mt-3 flex gap-2 border-t border-line pt-3">
          <button
            type="button"
            onClick={() => setModo('editar')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-control border border-line py-2 text-xs font-medium text-ink-soft active:scale-[0.98]"
          >
            <PencilSimple size={14} /> Editar
          </button>
          <button
            type="button"
            onClick={() => setModo('confirmarEliminar')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-control border border-line py-2 text-xs font-medium text-error active:scale-[0.98]"
          >
            <Trash size={14} /> Borrar
          </button>
        </div>
      )}

      {modo === 'confirmarEliminar' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 overflow-hidden rounded-control bg-error-soft p-3">
          <p className="mb-2 text-sm text-error">¿Borrar este servicio? No se puede deshacer.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setModo('ver')} className="flex-1 rounded-control border border-line bg-surface py-2 text-xs font-medium text-ink-soft">
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirmarEliminar}
              disabled={enviando}
              className="flex-1 rounded-control bg-error py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {enviando ? 'Borrando…' : 'Sí, borrar'}
            </button>
          </div>
        </motion.div>
      )}

      {modo === 'editar' && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={onGuardar}
          className="mt-3 flex flex-col gap-2 overflow-hidden border-t border-line pt-3"
        >
          <div className="relative min-w-0 overflow-hidden rounded-control border border-line bg-bg transition-colors focus-within:border-accent">
            <div className="pointer-events-none flex items-center justify-between px-3 py-2 text-sm text-ink">
              <span>{formatFechaLarga(fecha)}</span>
              <CalendarBlank size={16} className="shrink-0 text-ink-faint" />
            </div>
            <input
              type="date"
              value={fecha}
              max={hoyISO()}
              onChange={(e) => setFecha(e.target.value)}
              aria-label="Fecha del servicio"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>

          <select
            value={tipoServicioId}
            onChange={(e) => setTipoServicioId(e.target.value)}
            className="w-full min-w-0 rounded-control border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          >
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">S/</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full min-w-0 rounded-control border border-line bg-bg py-2 pl-8 pr-3 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <input
            type="text"
            placeholder="Nombre del cliente"
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
            className="w-full min-w-0 rounded-control border border-line bg-bg px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
          />
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Teléfono"
            value={clienteTelefono}
            onChange={(e) => setClienteTelefono(e.target.value)}
            className="w-full min-w-0 rounded-control border border-line bg-bg px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
          />

          <div className="mt-1 flex gap-2">
            <button type="button" onClick={() => setModo('ver')} className="flex-1 rounded-control border border-line py-2 text-xs font-medium text-ink-soft">
              Cancelar
            </button>
            <button type="submit" disabled={!puedeGuardar} className="flex-1 rounded-control bg-accent py-2 text-xs font-medium text-white disabled:opacity-50">
              {enviando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}
