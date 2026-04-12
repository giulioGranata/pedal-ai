import { getAthleteData } from '@/lib/data';
import ThemeToggle from '@/components/settings/ThemeToggle';

export default async function SettingsPage() {
  let updated_at = null;
  try {
    const data = await getAthleteData();
    updated_at = data.updated_at;
  } catch (e) {
    console.error("Errore recupero dati settings", e);
  }

  const formattedDate = updated_at ? new Date(updated_at).toLocaleString('it-IT') : 'Sconosciuta';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="text-gray-400 hidden md:inline">⚙️</span> Impostazioni
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-800">
        
        {/* Sezione Tema */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Aspetto applicazione</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Scegli tra tema chiaro o scuro, o segui la preferenza del tuo sistema operativo.</p>
          <ThemeToggle />
        </div>

        {/* Sezione Sincronizzazione Dati */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Sincronizzazione Dati</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            PedalAI sincronizza i dati da Intervals.icu ogni mattina alle 06:00 UTC tramite GitHub Actions.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 inline-flex items-center gap-3 border border-gray-100 dark:border-gray-800">
            <span className="flex h-2.5 w-2.5 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1D9E75] opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1D9E75]"></span>
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Ultimo aggiornamento: <strong>{formattedDate}</strong>
            </span>
          </div>
        </div>

        {/* Info Varie */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Informazioni Sistema</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1">
             <p>Versione: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-700 dark:text-gray-300">0.1.0-alpha</span></p>
             <p>LLM Engine: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-700 dark:text-gray-300">claude-sonnet-4</span></p>
          </div>
        </div>

      </div>

    </div>
  );
}
