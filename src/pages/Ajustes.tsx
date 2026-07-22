import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, LockKey, SignOut } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';
import { FormularioCambiarPassword } from '../components/FormularioCambiarPassword';
import { SelectorApariencia } from '../components/SelectorApariencia';
import { GestionTipos } from '../components/GestionTipos';
import { GestionPersonal } from '../components/GestionPersonal';

export function Ajustes() {
  const { usuario, cerrarSesion } = useAuth();
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);
  const [passwordCambiada, setPasswordCambiada] = useState(false);

  function onPasswordCambiada() {
    setMostrarCambioPassword(false);
    setPasswordCambiada(true);
    setTimeout(() => setPasswordCambiada(false), 3000);
  }

  return (
    <div className="min-h-dvh bg-bg px-5 pb-6 pt-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto flex max-w-sm flex-col gap-4">
        <h1 className="text-3xl text-ink">Ajustes</h1>

        <SelectorApariencia />

        <div className="rounded-card border border-line bg-surface p-5">
          <p className="text-sm text-ink-soft">Sesión iniciada como</p>
          <p className="text-lg text-ink">{usuario?.nombre}</p>
          <p className="mb-3 text-xs text-ink-faint">@{usuario?.usuario} · {usuario?.rol === 'admin' ? 'Administrador/a' : 'Empleado/a'}</p>

          <button
            type="button"
            onClick={() => setMostrarCambioPassword((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-accent"
          >
            <LockKey size={16} />
            Cambiar mi contraseña
          </button>

          <AnimatePresence>
            {mostrarCambioPassword && <FormularioCambiarPassword onListo={onPasswordCambiada} />}
          </AnimatePresence>
        </div>

        {usuario?.rol === 'admin' && (
          <>
            <GestionTipos />
            <GestionPersonal />
          </>
        )}

        <button
          onClick={cerrarSesion}
          className="flex w-full items-center justify-center gap-2 rounded-control border border-line bg-surface px-4 py-3 text-sm font-medium text-ink-soft transition-colors active:scale-[0.98]"
        >
          <SignOut size={18} />
          Cerrar sesión
        </button>
      </motion.div>

      <AnimatePresence>
        {passwordCambiada && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            role="status"
            className="fixed inset-x-0 bottom-24 mx-auto flex w-fit items-center gap-2 rounded-full bg-success px-4 py-2.5 text-sm font-medium text-white shadow-lg"
          >
            <CheckCircle size={18} weight="fill" />
            Contraseña actualizada
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
