import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';

export function FormularioCambiarPassword({ onListo }: { onListo: () => void }) {
  const { token } = useAuth();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeEnviar = actual && nueva.length >= 6 && nueva === confirmar && !enviando;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!puedeEnviar) return;
    setEnviando(true);
    setError(null);
    try {
      await api.post('cambiarPassword', { token, passwordActual: actual, passwordNuevo: nueva });
      onListo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cambiar tu contraseña.');
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
      className="flex flex-col gap-3 overflow-hidden pt-3"
    >
      <input
        type="password"
        placeholder="Contraseña actual"
        value={actual}
        onChange={(e) => setActual(e.target.value)}
        autoComplete="current-password"
        className="w-full rounded-control border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
      />
      <input
        type="password"
        placeholder="Contraseña nueva (mínimo 6 caracteres)"
        value={nueva}
        onChange={(e) => setNueva(e.target.value)}
        autoComplete="new-password"
        className="w-full rounded-control border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
      />
      <input
        type="password"
        placeholder="Confirmar contraseña nueva"
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
        autoComplete="new-password"
        className="w-full rounded-control border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
      />
      {confirmar && nueva !== confirmar && <p className="text-xs text-error">Las contraseñas no coinciden</p>}
      {error && (
        <p role="alert" className="rounded-control bg-error-soft px-3 py-2 text-xs text-error">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!puedeEnviar}
        className="rounded-control bg-accent px-4 py-2.5 text-sm font-medium text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {enviando ? 'Guardando…' : 'Guardar nueva contraseña'}
      </button>
    </motion.form>
  );
}
