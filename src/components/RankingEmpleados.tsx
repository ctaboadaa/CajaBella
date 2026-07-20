import { motion } from 'motion/react';
import { Trophy } from '@phosphor-icons/react';
import { formatMonto } from '../lib/format';

interface Props {
  porEmpleado: { usuarioNombre: string; total: number; cantidad: number }[];
}

export function RankingEmpleados({ porEmpleado }: Props) {
  if (porEmpleado.length < 2) return null;

  const max = porEmpleado[0].total;

  return (
    <div className="rounded-card border border-line bg-surface p-6">
      <div className="mb-3 flex items-center gap-2 text-sm text-ink-soft">
        <Trophy size={16} className="text-gold" weight="fill" />
        Ranking del mes
      </div>
      <ol className="flex flex-col gap-3">
        {porEmpleado.map((e, i) => (
          <li key={e.usuarioNombre}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-medium text-ink">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-soft text-[11px] font-semibold text-gold">
                  {i + 1}
                </span>
                <span className="truncate">{e.usuarioNombre}</span>
              </span>
              <span className="shrink-0 text-ink-soft">{formatMonto(e.total)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(e.total / max) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 + i * 0.06 }}
                className="h-full rounded-full bg-gold"
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
