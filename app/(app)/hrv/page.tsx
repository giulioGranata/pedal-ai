import { getAthleteData } from '@/lib/data';
import HrvCharts from '@/components/hrv/HrvCharts';

export default async function HrvPage() {
  const data = await getAthleteData();
  const { wellness } = data;

  // Analisi di base per l'interpretazione dello stato di forma
  const hrvAvg = wellness.history && wellness.history.length > 0 
    ? Math.round(wellness.history.reduce((acc, w) => acc + (w.hrv || 0), 0) / wellness.history.length) 
    : wellness.hrv;
    
  const isHrvGood = wellness.hrv >= hrvAvg;
  const isHrGood = wellness.resting_hr <= 55;
  const isSleepGood = wellness.sleep_hours >= 7;

  let interpretazione = '';
  if (isHrvGood && isHrGood && isSleepGood) {
    interpretazione = 'Ottimo stato di recupero neurale e fisico. Il sistema parasimpatico è dominante, sei pronto per un carico intenso.';
  } else if (!isHrvGood && !isHrGood) {
    interpretazione = 'Possibile stato di affaticamento sistemico. Considera uno o più giorni di recupero attivo (Z1/Z2 leggero) o riposo completo.';
  } else {
    interpretazione = 'Stato di forma intermedio. Ascolta il tuo corpo durante il riscaldamento e valuta se mantenere l\'allenamento previsto o modularlo in base alle tue sensazioni.';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="text-blue-500">❤️</span> Wellness & Recupero
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          Monitora la variabilità della frequenza cardiaca mattutina (HRV), i battiti a riposo e la qualità del sonno. 
          Questi parametri vitali ti indicano la reale prontezza del tuo sistema nervoso autonomo ad affrontare nuovi stimoli allenanti.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4 flex gap-4">
        <div className="text-blue-500 font-bold text-xl mt-0.5">ℹ️</div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Coach Interpretazione</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {interpretazione} Oggi: HRV <strong>{wellness.hrv}ms</strong> | FC riposo <strong>{wellness.resting_hr} bpm</strong>
          </p>
        </div>
      </div>

      {wellness.history && wellness.history.length > 0 ? (
        <HrvCharts history={wellness.history} />
      ) : (
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">Nessun dato storico di wellness disponibile.</p>
        </div>
      )}

    </div>
  );
}
