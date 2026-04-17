// ActivityList — lista ultime 5 attività con nome, durata, NP, TSS
// Server Component

import type { Activity } from '@/lib/types';
import { formatWeekdayShortDate, parseISODateUTC } from '@/lib/date';

interface ActivityListProps {
  activities: Activity[];
}

// Formatta i secondi in formato "h:mm"
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

// Formatta i metri in km
function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(0)} km`;
}

// Colore TSS in base all'intensità
function tssColor(tss: number): string {
  if (tss >= 150) return 'text-red-500 dark:text-red-400';
  if (tss >= 100) return 'text-amber-500 dark:text-amber-400';
  if (tss >= 60) return 'text-emerald-600 dark:text-emerald-400';
  return 'text-gray-500 dark:text-gray-400';
}

export default function ActivityList({ activities }: ActivityListProps) {
  // Ordina per data decrescente (più recente in cima) e mostra le ultime 5
  const recent = [...activities]
    .sort((a, b) => parseISODateUTC(b.date).getTime() - parseISODateUTC(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Attività recenti
      </h2>

      {recent.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-700 p-6 text-sm text-gray-400">
          Nessuna attività disponibile in questo periodo. Ottimo momento per recuperare.
        </div>
      )}

      <div className="space-y-0.5">
        {recent.map((activity, i) => (
          <div
            key={activity.id}
            className={`
              flex items-center justify-between py-2.5 px-2 rounded-lg
              ${i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800/50'}
            `}
          >
            {/* Nome e data */}
            <div className="min-w-0 flex-1 pr-4">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {activity.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {formatWeekdayShortDate(activity.date)}
              </p>
            </div>

            {/* Metriche */}
            <div className="flex items-center gap-4 shrink-0 text-right">
              <div className="hidden sm:block">
                <p className="text-xs text-gray-400 dark:text-gray-500">Distanza</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                  {formatDistance(activity.distance_meters)}
                </p>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-gray-400 dark:text-gray-500">Durata</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                  {formatDuration(activity.duration_seconds)}
                </p>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-gray-400 dark:text-gray-500">NP</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                  {activity.normalized_power}W
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">TSS</p>
                <p className={`text-sm font-semibold tabular-nums ${tssColor(activity.tss)}`}>
                  {activity.tss}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
