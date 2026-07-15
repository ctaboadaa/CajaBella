import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiClientError } from '../api/client';
import type { Usuario } from '../api/types';

const STORAGE_KEY = 'cajabella_sesion';

interface SesionGuardada {
  token: string;
  usuario: Usuario;
}

interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  iniciarSesion: (usuario: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<SesionGuardada | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const guardada = localStorage.getItem(STORAGE_KEY);
    if (guardada) {
      try {
        setSesion(JSON.parse(guardada));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setCargando(false);
  }, []);

  async function iniciarSesion(usuario: string, password: string) {
    const respuesta = await api.post<{ ok: true; token: string; usuario: Usuario }>('login', { usuario, password });
    const nuevaSesion = { token: respuesta.token, usuario: respuesta.usuario };
    setSesion(nuevaSesion);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevaSesion));
  }

  function cerrarSesion() {
    setSesion(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario: sesion?.usuario ?? null,
      token: sesion?.token ?? null,
      cargando,
      iniciarSesion,
      cerrarSesion,
    }),
    [sesion, cargando],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}

export { ApiClientError };
