import { getAthleteData } from '@/lib/data';
import ExpandedFitnessChart from '@/components/ctl-atl/ExpandedFitnessChart';

export default async function CtlAtlPage() {
  const data = await getAthleteData();
  const { fitness } = data;

  // Unifica i dati in un singolo array per la tabella, e prendi solo le ultime 28 entry (4 settimane)
  const dataMap = new Map();
  fitness.ctl_history.forEach(p => dataMap.set(p.date, { date: p.date, CTL: p.value }));
  fitness.atl_history.forEach(p => {
    if (dataMap.has(p.date)) dataMap.get(p.date).ATL = p.value;
  });
  fitness.tsb_history.forEach(p => {
    if (dataMap.has(p.date)) dataMap.get(p.date).TSB = p.value;
  });

  const history = Array.from(dataMap.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Decrescente per la tabella
    .slice(0, 28); // Ultime 4 settimane

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="text-[#1D9E75]">⚡</span> Modello Fitness (PMC)
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
          Il Performance Management Chart traccia il tuo carico di allenamento nel tempo. 
          Monitora la tua <strong className="text-gray-800 dark:text-gray-200">Fitness (CTL)</strong> costruita nel lungo termine, 
          la <strong className="text-gray-800 dark:text-gray-200">Fatica (ATL)</strong> accumulata nei giorni recenti e la tua 
          attuale <strong className="text-gray-800 dark:text-gray-200">Forma (TSB)</strong>, che ti indica se sei riposato o in un blocco di sovraccarico.
        </p>
      </div>

      <ExpandedFitnessChart 
        ctlHistory={fitness.ctl_history} 
        atlHistory={fitness.atl_history} 
        tsbHistory={fitness.tsb_history} 
      />

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Dettaglio Ultime 4 Settimane</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">CTL (Fitness)</th>
                <th className="px-4 py-3 font-medium">ATL (Fatica)</th>
                <th className="px-4 py-3 font-medium">TSB (Forma)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {history.map((row) => (
                <tr key={row.date} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {new Date(row.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1D9E75]">{row.CTL}</td>
                  <td className="px-4 py-3 font-medium text-red-500">{row.ATL}</td>
                  <td className="px-4 py-3 font-medium">
                    <span className={row.TSB >= 0 ? 'text-blue-500' : 'text-amber-500'}>
                      {row.TSB > 0 ? '+' : ''}{row.TSB}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
