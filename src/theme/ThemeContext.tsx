import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Tema = 'claro' | 'oscuro' | 'sistema';

const STORAGE_KEY = 'cajabella_tema';

interface ThemeContextValue {
  tema: Tema;
  esOscuro: boolean;
  setTema: (tema: Tema) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function prefiereOscuroSistema(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function calcularOscuro(tema: Tema): boolean {
  return tema === 'oscuro' || (tema === 'sistema' && prefiereOscuroSistema());
}

function aplicarClase(esOscuro: boolean) {
  document.documentElement.classList.toggle('dark', esOscuro);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<Tema>(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado === 'claro' || guardado === 'oscuro' || guardado === 'sistema' ? guardado : 'sistema';
  });
  const [esOscuro, setEsOscuro] = useState(() => calcularOscuro(tema));

  useEffect(() => {
    const oscuro = calcularOscuro(tema);
    setEsOscuro(oscuro);
    aplicarClase(oscuro);
  }, [tema]);

  useEffect(() => {
    if (tema !== 'sistema') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      setEsOscuro(mq.matches);
      aplicarClase(mq.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [tema]);

  function setTema(nuevoTema: Tema) {
    localStorage.setItem(STORAGE_KEY, nuevoTema);
    setTemaState(nuevoTema);
  }

  return <ThemeContext.Provider value={{ tema, esOscuro, setTema }}>{children}</ThemeContext.Provider>;
}

export function useTema() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTema debe usarse dentro de <ThemeProvider>');
  return ctx;
}
