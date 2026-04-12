'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { WellnessPoint } from '@/lib/types';

interface HrvChartsProps {
  history: WellnessPoint[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

export default function HrvCharts({ history }: HrvChartsProps) {
  // Prep data (ultimi 30 giorni, se disponibili)
  const data = history.slice(-30).map(p => ({
    ...p,
    label: formatDate(p.date),
  }));

  const tickInterval = Math.max(1, Math.floor(data.length / 5));

  return (
    <div className="space-y-6">
      
      {/* Grafico HRV */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Trend HRV (Heart Rate Variability)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} interval={tickInterval} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e5e7eb' }} />
            <Area type="monotone" dataKey="hrv" name="HRV (ms)" stroke="#1D9E75" strokeWidth={2} fillOpacity={1} fill="url(#colorHrv)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Grafico Resting HR */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Frequenza Cardiaca a Riposo</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
             <defs>
              <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} interval={tickInterval} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} domain={['dataMin - 2', 'auto']} />
            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e5e7eb' }} />
            <Area type="monotone" dataKey="resting_hr" name="Battiti (bpm)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHr)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Grafico Sonno */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Ore di Sonno</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} interval={tickInterval} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} domain={[0, 10]} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e5e7eb' }} />
            <Bar dataKey="sleep_hours" name="Sonno (ore)" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
