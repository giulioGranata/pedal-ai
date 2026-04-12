// WellnessPanel — HRV, resting HR, sonno con barre di progresso
// Server Component

import type { WellnessData } from '@/lib/types';

interface WellnessPanelProps {
  wellness: WellnessData;
}

interface WellnessRowProps {
  label: string;
  value: number;
  unit: string;
  percent: number; // 0-100 per la barra di progresso
  color: string;
  note?: string;
}

function WellnessRow({ label, value, unit, percent, color, note }: WellnessRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
          {value}
          <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>
        </span>
      </div>
      {/* Barra di progresso */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, percent)}%`, backgroundColor: color }}
        />
      </div>
      {note && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{note}</p>
      )}
    </div>
  );
}

// Livello energetico sotto forma di emoji
function energyLabel(energy: number): string {
  const labels = ['', '😫 Pessimo', '😕 Scarso', '😐 Normale', '😊 Buono', '🔥 Ottimo'];
  return labels[Math.min(5, Math.max(0, energy))] ?? '—';
}

export default function WellnessPanel({ wellness }: WellnessPanelProps) {
  // HRV: range indicativo 30-100ms — normalizzato su 100
  const hrvPercent = ((wellness.hrv - 30) / 70) * 100;

  // Resting HR: range 35-75bpm — lower is better, invertiamo
  const hrPercent = ((75 - wellness.resting_hr) / 40) * 100;

  // Sonno: range 5-10h — normalizzato su 100
  const sleepPercent = ((wellness.sleep_hours - 5) / 5) * 100;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Wellness oggi
      </h2>

      <div className="space-y-4">
        <WellnessRow
          label="HRV"
          value={wellness.hrv}
          unit="ms"
          percent={hrvPercent}
          color="#1D9E75"
          note={wellness.hrv >= 60 ? 'Ottima variabilità' : wellness.hrv >= 45 ? 'Nella norma' : 'Bassa — riposo consigliato'}
        />
        <WellnessRow
          label="Frequenza cardiaca a riposo"
          value={wellness.resting_hr}
          unit="bpm"
          percent={hrPercent}
          color="#3b82f6"
          note={wellness.resting_hr <= 50 ? 'Eccellente' : wellness.resting_hr <= 60 ? 'Nella norma' : 'Elevata — possibile affaticamento'}
        />
        <WellnessRow
          label="Sonno"
          value={wellness.sleep_hours}
          unit="h"
          percent={sleepPercent}
          color="#8b5cf6"
          note={wellness.sleep_hours >= 7.5 ? 'Recupero ottimale' : wellness.sleep_hours >= 6.5 ? 'Sufficiente' : 'Insufficiente'}
        />

        {/* Energia soggettiva */}
        <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Energia percepita</span>
            <span className="text-sm">{energyLabel(wellness.energy)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
