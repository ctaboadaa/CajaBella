import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeSlash, Sparkle } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';

export function Login() {
  const { iniciarSesion } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!usuario.trim() || !password) return;
    setEnviando(true);
    setError(null);
    try {
      await iniciarSesion(usuario.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos iniciar sesión. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 15% 10%, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent), radial-gradient(50% 45% at 90% 85%, color-mix(in srgb, var(--color-gold) 20%, transparent), transparent)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Sparkle size={26} weight="fill" />
          </span>
          <h1 className="text-4xl leading-none text-ink">CajaBella</h1>
          <p className="mt-2 text-sm text-ink-soft">El control de tu salón, siempre a la mano.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onSubmit={onSubmit}
          className="rounded-card border border-line bg-surface p-6 shadow-[0_16px_40px_-24px_rgba(50,32,34,0.35)]"
        >
          <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="usuario">
            Usuario
          </label>
          <input
            id="usuario"
            type="text"
            autoComplete="username"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="ej. rosa"
            className="mb-4 w-full rounded-control border border-line bg-bg px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
          />

          <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="password">
            Contraseña
          </label>
          <div className="relative mb-2">
            <input
              id="password"
              type={mostrarPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-control border border-line bg-bg px-4 py-3 pr-12 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setMostrarPassword((v) => !v)}
              aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-ink-soft"
            >
              {mostrarPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mb-3 rounded-control bg-error-soft px-3 py-2 text-sm text-error"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={enviando || !usuario.trim() || !password}
            className="mt-3 w-full rounded-control bg-accent px-4 py-3 text-base font-medium text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </motion.form>

        <p className="mt-6 text-center text-xs text-ink-faint">
          ¿Olvidaste tu contraseña? Pídele a quien administra CajaBella que te la restablezca desde Ajustes.
        </p>
      </motion.div>
    </div>
  );
}
