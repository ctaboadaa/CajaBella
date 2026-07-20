import { CalendarBlank } from '@phosphor-icons/react';
import { formatFechaLarga } from '../lib/format';

interface Props {
  value: string;
  onChange: (value: string) => void;
  max?: string;
  min?: string;
  label: string;
}

// Mismo patrón que el campo de fecha de Registrar/Historial: el input nativo va invisible
// encima, solo para abrir el calendario del teléfono. Lo que se VE es texto propio, así el
// render nativo (que en iOS Safari se puede desbordar de su caja) nunca queda visible.
export function CampoFecha({ value, onChange, max, min, label }: Props) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-control border border-line bg-bg transition-colors focus-within:border-accent">
      <div className="pointer-events-none flex items-center justify-between px-4 py-3 text-base text-ink">
        <span>{formatFechaLarga(value)}</span>
        <CalendarBlank size={20} className="shrink-0 text-ink-faint" />
      </div>
      <input
        type="date"
        value={value}
        max={max}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
