import { NavLink } from 'react-router-dom';
import { ChartBar, ClipboardText, Gear, PlusCircle } from '@phosphor-icons/react';

const items = [
  { to: '/registrar', label: 'Registrar', Icon: PlusCircle },
  { to: '/resumen', label: 'Resumen', Icon: ChartBar },
  { to: '/historial', label: 'Historial', Icon: ClipboardText },
  { to: '/ajustes', label: 'Ajustes', Icon: Gear },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
      <ul className="mx-auto flex max-w-sm items-stretch justify-around">
        {items.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-accent' : 'text-ink-faint'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={24} weight={isActive ? 'fill' : 'regular'} />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
