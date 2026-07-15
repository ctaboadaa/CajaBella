import { useEffect, useState } from 'react';

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// requestAnimationFrame no corre en pestañas en segundo plano (el navegador lo pausa para
// ahorrar batería), así que animar ahí solo dejaría el número congelado en 0. Se salta la
// animación en ese caso y se muestra el valor final directo.
const saltarAnimacion = () => prefiereMenosMovimiento() || (typeof document !== 'undefined' && document.hidden);

export function useCountUp(valorFinal: number, duracionMs = 700): number {
  const [valor, setValor] = useState(saltarAnimacion() ? valorFinal : 0);

  useEffect(() => {
    if (saltarAnimacion()) {
      setValor(valorFinal);
      return;
    }
    const inicio = performance.now();
    const desde = 0;
    let frame: number;

    function tick(ahora: number) {
      const progreso = Math.min((ahora - inicio) / duracionMs, 1);
      const easeOut = 1 - Math.pow(1 - progreso, 3);
      setValor(desde + (valorFinal - desde) * easeOut);
      if (progreso < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valorFinal, duracionMs]);

  return valor;
}
