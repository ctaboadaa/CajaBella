import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import type { Usuario } from '../api/types';
import { Toggle } from './Toggle';

type Estado = { tipo: 'cargando' } | { tipo: 'error'; mensaje: string } | { tipo: 'listo' };

export function GestionPersonal() {
  const { token, usuario: yo } = useAuth();
  const [personas, setPersonas] = useState<Usuario[]>([]);
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [restableciendoId, setRestableciendoId] = useState<string | null>(null);

  function cargar() {
    setEstado({ tipo: 'cargando' });
    api
      .get<{ ok: true; usuarios: Usuario[] }>('usuarios', { token: token ?? undefined })
      .then((r) => {
        setPersonas(r.usuarios);
        setEstado({ tipo: 'listo' });
      })
      .catch((err) => setEstado({ tipo: 'error', mensaje: err instanceof Error ? err.message : 'No pudimos cargar el personal.' }));
  }

  useEffect(cargar, [token]);

  async function onToggle(id: string, activo: boolean) {
    setPersonas((prev) => prev.map((p) => (p.id === id ? { ...p, activo } : p)));
    try {
      await api.post('actualizarUsuario', { token, id, activo });
    } catch {
      cargar();
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-ink">Personal</h2>

      {estado.tipo === 'cargando' && (
        <div className="flex flex-col gap-2">
          <div className="h-12 animate-pulse rounded-control bg-surface-elevated" />
          <div className="h-12 animate-pulse rounded-control bg-surface-elevated" />
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
          {personas.map((p) => (
            <li key={p.id} className="rounded-control border border-line px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">
                    {p.nombre} {p.id === yo?.id && <span className="text-ink-faint">(tú)</span>}
                  </p>
                  <p className="text-xs text-ink-faint">
                    @{p.usuario} · {p.rol === 'admin' ? 'Administrador/a' : 'Empleado/a'}
                  </p>
                </div>
                <Toggle activo={p.activo !== false} onChange={(v) => onToggle(p.id, v)} label={`Activar o desactivar a ${p.nombre}`} disabled={p.id === yo?.id} />
              </div>

              {p.id !== yo?.id && (
                <button
                  type="button"
                  onClick={() => setRestableciendoId((actual) => (actual === p.id ? null : p.id))}
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-ink-soft underline underline-offset-2"
                >
                  <ArrowCounterClockwise size={13} />
                  Restablecer contraseña
                </button>
              )}

              <AnimatePresence>
                {restableciendoId === p.id && <RestablecerPassword id={p.id} onListo={() => setRestableciendoId(null)} />}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {mostrarForm ? (
          <NuevaPersona key="form" onCancelar={() => setMostrarForm(false)} onCreada={() => { setMostrarForm(false); cargar(); }} />
        ) : (
          <motion.button
            key="boton"
            type="button"
            onClick={() => setMostrarForm(true)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-control border border-dashed border-line px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors active:scale-[0.98]"
          >
            <Plus size={16} />
            Agregar persona
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function NuevaPersona({ onCancelar, onCreada }: { onCancelar: () => void; onCreada: () => void }) {
  const { token } = useAuth();
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'empleado' | 'admin'>('empleado');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeEnviar = nombre.trim() && usuario.trim() && password.length >= 6 && !enviando;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!puedeEnviar) return;
    setEnviando(true);
    setError(null);
    try {
      await api.post('crearUsuario', { token, nombre: nombre.trim(), usuario: usuario.trim(), password, rol });
      onCreada();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear la cuenta.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onSubmit={onSubmit}
      className="mt-3 flex flex-col gap-2 overflow-hidden"
    >
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" className="rounded-control border border-line bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-accent" />
      <input value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Usuario para iniciar sesión" className="rounded-control border border-line bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-accent" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña inicial (mínimo 6 caracteres)" className="rounded-control border border-line bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-accent" />
      <select value={rol} onChange={(e) => setRol(e.target.value as 'empleado' | 'admin')} className="rounded-control border border-line bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-accent">
        <option value="empleado">Empleado/a — solo registra servicios</option>
        <option value="admin">Administrador/a — también gestiona ajustes</option>
      </select>
      {error && <p role="alert" className="rounded-control bg-error-soft px-3 py-2 text-xs text-error">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onCancelar} className="flex-1 rounded-control border border-line px-3 py-2.5 text-sm font-medium text-ink-soft">
          Cancelar
        </button>
        <button type="submit" disabled={!puedeEnviar} className="flex-1 rounded-control bg-accent px-3 py-2.5 text-sm font-medium text-white transition-all active:scale-[0.98] disabled:opacity-50">
          {enviando ? 'Creando…' : 'Crear cuenta'}
        </button>
      </div>
    </motion.form>
  );
}

function RestablecerPassword({ id, onListo }: { id: string; onListo: () => void }) {
  const { token } = useAuth();
  const [nueva, setNueva] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (nueva.length < 6 || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      await api.post('actualizarUsuario', { token, id, nuevaPassword: nueva });
      onListo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos restablecer la contraseña.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={onSubmit}
      className="mt-2 flex gap-2 overflow-hidden"
    >
      <input
        type="password"
        value={nueva}
        onChange={(e) => setNueva(e.target.value)}
        placeholder="Nueva contraseña (mínimo 6)"
        className="min-w-0 flex-1 rounded-control border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <button type="submit" disabled={nueva.length < 6 || enviando} className="shrink-0 rounded-control bg-accent px-3 py-2 text-xs font-medium text-white disabled:opacity-50">
        {enviando ? '...' : 'Guardar'}
      </button>
      {error && <p className="text-xs text-error">{error}</p>}
    </motion.form>
  );
}
