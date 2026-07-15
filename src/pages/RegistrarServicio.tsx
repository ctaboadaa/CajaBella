import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, User, Phone } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import type { TipoServicio } from '../api/types';
import { hoyISO } from '../lib/format';

type TiposEstado = { tipo: 'cargando' } | { tipo: 'error'; mensaje: string } | { tipo: 'listo'; opciones: TipoServicio[] };

export function RegistrarServicio() {
  const { token } = useAuth();
  const [tipos, setTipos] = useState<TiposEstado>({ tipo: 'cargando' });

  const [fecha, setFecha] = useState(hoyISO());
  const [tipoServicioId, setTipoServicioId] = useState('');
  const [monto, setMonto] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  function cargarTipos() {
    setTipos({ tipo: 'cargando' });
    api
      .get<{ ok: true; tipos: TipoServicio[] }>('tiposServicio', { token: token ?? undefined })
      .then((r) => {
        setTipos({ tipo: 'listo', opciones: r.tipos });
        setTipoServicioId((actual) => actual || r.tipos[0]?.id || '');
      })
      .catch((err) => setTipos({ tipo: 'error', mensaje: err instanceof Error ? err.message : 'No pudimos cargar los tipos de servicio.' }));
  }

  useEffect(cargarTipos, [token]);

  const montoNumero = Number(monto);
  const puedeEnviar = !!fecha && !!tipoServicioId && montoNumero > 0 && !enviando;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!puedeEnviar) return;
    setEnviando(true);
    setError(null);
    try {
      await api.post('crearServicio', {
        token,
        fecha,
        tipoServicioId,
        monto: montoNumero,
        clienteNombre: clienteNombre.trim(),
        clienteTelefono: clienteTelefono.trim(),
      });
      setExito(true);
      setMonto('');
      setClienteNombre('');
      setClienteTelefono('');
      setTimeout(() => setExito(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg px-5 pb-6 pt-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto max-w-sm">
        <h1 className="mb-1 text-3xl text-ink">Registrar servicio</h1>
        <p className="mb-5 text-sm text-ink-soft">Anota cada servicio apenas lo termines.</p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
          <div>
            <label htmlFor="fecha" className="mb-1.5 block text-sm font-medium text-ink">
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              max={hoyISO()}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-control border border-line bg-bg px-4 py-3 text-base text-ink outline-none transition-colors focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="tipo" className="mb-1.5 block text-sm font-medium text-ink">
              Tipo de servicio
            </label>
            {tipos.tipo === 'cargando' && <div className="h-[50px] animate-pulse rounded-control bg-surface-elevated" />}
            {tipos.tipo === 'error' && (
              <div className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
                {tipos.mensaje}{' '}
                <button type="button" onClick={cargarTipos} className="font-medium underline underline-offset-2">
                  Reintentar
                </button>
              </div>
            )}
            {tipos.tipo === 'listo' && tipos.opciones.length === 0 && (
              <p className="rounded-control bg-warning-soft px-3 py-2 text-sm text-warning">
                No hay tipos de servicio configurados. Pídele a un administrador que agregue uno en Ajustes.
              </p>
            )}
            {tipos.tipo === 'listo' && tipos.opciones.length > 0 && (
              <select
                id="tipo"
                value={tipoServicioId}
                onChange={(e) => setTipoServicioId(e.target.value)}
                className="w-full rounded-control border border-line bg-bg px-4 py-3 text-base text-ink outline-none transition-colors focus:border-accent"
              >
                {tipos.opciones.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="monto" className="mb-1.5 block text-sm font-medium text-ink">
              Monto
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">S/</span>
              <input
                id="monto"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full rounded-control border border-line bg-bg py-3 pl-10 pr-4 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
              />
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">Datos del cliente (opcional)</p>
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="clienteNombre" className="sr-only">
                  Nombre del cliente
                </label>
                <div className="relative">
                  <User size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    id="clienteNombre"
                    type="text"
                    placeholder="Nombre del cliente"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full rounded-control border border-line bg-bg py-3 pl-10 pr-4 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="clienteTelefono" className="sr-only">
                  Teléfono del cliente
                </label>
                <div className="relative">
                  <Phone size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    id="clienteTelefono"
                    type="tel"
                    placeholder="Teléfono"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    className="w-full rounded-control border border-line bg-bg py-3 pl-10 pr-4 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={!puedeEnviar}
            className="mt-1 w-full rounded-control bg-accent px-4 py-3 text-base font-medium text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando ? 'Guardando…' : 'Registrar servicio'}
          </button>
        </form>
      </motion.div>

      <AnimatePresence>
        {exito && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            role="status"
            className="fixed inset-x-0 bottom-24 mx-auto flex w-fit items-center gap-2 rounded-full bg-success px-4 py-2.5 text-sm font-medium text-white shadow-lg"
          >
            <CheckCircle size={18} weight="fill" />
            Servicio registrado
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
