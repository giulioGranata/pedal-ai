// Dashboard home — legge i dati da /api/data e compone i componenti
// Server Component: fetch server-side, nessun loading state necessario

import { getAthleteData } from '@/lib/data';
import StatusBar from '@/components/dashboard/StatusBar';
import MetricCard from '@/components/dashboard/MetricCard';
import CTLATLChart from '@/components/dashboard/CTLATLChart';
import TSBChart from '@/components/dashboard/TSBChart';
import ActivityList from '@/components/dashboard/ActivityList';
import WellnessPanel from '@/components/dashboard/WellnessPanel';

export default async function HomePage() {
  const data = await getAthleteData();
  const { fitness, wellness, activities } = data;

  // Calcola i delta rispetto al giorno precedente per le MetricCard
  const ctlHist = fitness.ctl_history;
  const atlHist = fitness.atl_history;
  const tsbHist = fitness.tsb_history;
  const ctlDelta = ctlHist.length >= 2 ? fitness.ctl - ctlHist[ctlHist.length - 2].value : 0;
  const atlDelta = atlHist.length >= 2 ? fitness.atl - atlHist[atlHist.length - 2].value : 0;
  const tsbDelta = tsbHist.length >= 2 ? fitness.tsb - tsbHist[tsbHist.length - 2].value : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

      {/* Banner stato forma */}
      <StatusBar tsb={fitness.tsb} atl={fitness.atl} ctl={fitness.ctl} />

      {/* Grid metriche principali */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="CTL"
          value={fitness.ctl}
          delta={ctlDelta}
          description="Fitness cronica — media carico allenamento 42 giorni"
        />
        <MetricCard
          label="ATL"
          value={fitness.atl}
          delta={atlDelta}
          description="Fatica acuta — media carico allenamento 7 giorni"
        />
        <MetricCard
          label="TSB"
          value={fitness.tsb}
          delta={tsbDelta}
          description="Forma — CTL meno ATL. Negativo = in carico"
        />
        <MetricCard
          label="HRV"
          value={wellness.hrv}
          unit="ms"
          description="Variabilità frequenza cardiaca mattutina"
        />
      </div>

      {/* Grafici CTL/ATL e TSB affiancati su desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CTLATLChart ctlHistory={fitness.ctl_history} atlHistory={fitness.atl_history} />
        <TSBChart tsbHistory={fitness.tsb_history} />
      </div>

      {/* Lista attività + pannello wellness affiancati su desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ActivityList activities={activities} />
        </div>
        <div>
          <WellnessPanel wellness={wellness} />
        </div>
      </div>

    </div>
  );
}
