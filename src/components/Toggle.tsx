interface ToggleProps {
  activo: boolean;
  onChange: (valor: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Toggle({ activo, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!activo)}
      className="flex h-11 w-11 shrink-0 items-center justify-center disabled:opacity-40"
    >
      <span className={`relative h-7 w-12 rounded-full transition-colors ${activo ? 'bg-success' : 'bg-surface-sunken'}`}>
        <span
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: activo ? 'translateX(22px)' : 'translateX(4px)' }}
        />
      </span>
    </button>
  );
}
