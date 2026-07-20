import { CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { formatFechaCorta, hoyISO, sumarDias } from '../lib/format';

interface Props {
  fecha: string;
  onCambiarFecha: (fecha: string) => void;
}

export function SelectorDeFecha({ fecha, onCambiarFecha }: Props) {
  const esHoy = fecha === hoyISO();

  return (
    <div className="flex items-center justify-between">
      <button
        aria-label="Día anterior"
        onClick={() => onCambiarFecha(sumarDias(fecha, -1))}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft active:scale-[0.95]"
      >
        <CaretLeft size={16} />
      </button>

      <div className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink transition-colors active:bg-surface-elevated">
        <CalendarBlank size={14} className="text-ink-faint" />
        <span>{esHoy ? 'Hoy' : formatFechaCorta(fecha)}</span>
        <input
          type="date"
          value={fecha}
          max={hoyISO()}
          onChange={(e) => onCambiarFecha(e.target.value)}
          aria-label="Elegir el día que quieres ver"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>

      <button
        aria-label="Día siguiente"
        onClick={() => onCambiarFecha(sumarDias(fecha, 1))}
        disabled={esHoy}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-opacity active:scale-[0.95] disabled:opacity-30"
      >
        <CaretRight size={16} />
      </button>
    </div>
  );
}
