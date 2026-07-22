import { Moon, Sun, DeviceMobile } from '@phosphor-icons/react';
import { useTema, type Tema } from '../theme/ThemeContext';

const opciones: { valor: Tema; etiqueta: string; Icon: typeof Sun }[] = [
  { valor: 'claro', etiqueta: 'Claro', Icon: Sun },
  { valor: 'oscuro', etiqueta: 'Oscuro', Icon: Moon },
  { valor: 'sistema', etiqueta: 'Automático', Icon: DeviceMobile },
];

export function SelectorApariencia() {
  const { tema, setTema } = useTema();

  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-ink">Apariencia</h2>
      <div className="flex gap-1 rounded-control bg-surface-elevated p-1">
        {opciones.map(({ valor, etiqueta, Icon }) => (
          <button
            key={valor}
            type="button"
            onClick={() => setTema(valor)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-control py-2 text-xs font-medium transition-colors ${
              tema === valor ? 'bg-surface text-ink shadow-sm' : 'text-ink-faint'
            }`}
          >
            <Icon size={18} weight={tema === valor ? 'fill' : 'regular'} />
            {etiqueta}
          </button>
        ))}
      </div>
    </div>
  );
}
