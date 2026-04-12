// MetricCard — card cliccabile per CTL, ATL, TSB, HRV
// Server Component che naviga alla sottorotta corrispondente

import Link from 'next/link';

interface MetricCardProps {
  label: string;
  value: number;
  unit?: string;
  delta?: number;        // variazione rispetto al giorno precedente
  href: string;          // rotta di dettaglio
  description: string;   // breve descrizione della metrica
}

// Colore del delta in base al segno e alla metrica
function DeltaBadge({ delta, invertColors = false }: { delta: number; invertColors?: boolean }) {
  const isPositive = delta > 0;
  const isGood = invertColors ? !isPositive : isPositive;

  const colorClass = delta === 0
    ? 'text-gray-500 dark:text-gray-400'
    : isGood
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-500 dark:text-red-400';

  const prefix = delta > 0 ? '+' : '';
  return (
    <span className={`text-xs font-medium ${colorClass}`}>
      {prefix}{delta}
    </span>
  );
}

export default function MetricCard({
  label,
  value,
  unit,
  delta,
  href,
  description,
}: MetricCardProps) {
  return (
    <Link
      href={href}
      className="
        group block bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        rounded-xl p-4
        hover:border-[#1D9E75] dark:hover:border-[#1D9E75]
        hover:shadow-sm
        transition-all duration-200
      "
    >
      {/* Label + freccia hover */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-gray-300 dark:text-gray-700 group-hover:text-[#1D9E75] transition-colors text-xs">
          ›
        </span>
      </div>

      {/* Valore principale */}
      <div className="flex items-end gap-2 mb-1">
        <span className="text-2xl font-medium text-gray-900 dark:text-gray-100 tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-gray-400 dark:text-gray-500 mb-0.5">{unit}</span>
        )}
        {delta !== undefined && (
          <span className="mb-0.5">
            <DeltaBadge delta={delta} invertColors={label === 'TSB'} />
          </span>
        )}
      </div>

      {/* Descrizione breve */}
      <p className="text-xs text-gray-400 dark:text-gray-500 leading-snug">{description}</p>
    </Link>
  );
}
