'use client';

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import type { HistoryPoint } from '@/lib/types';

interface ExpandedFitnessChartProps {
  ctlHistory: HistoryPoint[];
  atlHistory: HistoryPoint[];
  tsbHistory: HistoryPoint[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

export default function ExpandedFitnessChart({ ctlHistory, atlHistory, tsbHistory }: ExpandedFitnessChartProps) {
  // Unifica i dati in un singolo array
  const dataMap = new Map();
  ctlHistory.forEach(p => dataMap.set(p.date, { date: p.date, label: formatDate(p.date), CTL: p.value }));
  atlHistory.forEach(p => {
    if (dataMap.has(p.date)) dataMap.get(p.date).ATL = p.value;
  });
  tsbHistory.forEach(p => {
    if (dataMap.has(p.date)) dataMap.get(p.date).TSB = p.value;
  });

  const data = Array.from(dataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  // Prendi solo gli ultimi 90 giorni
  const last90 = data.slice(-90);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 h-[400px]">
      <div className="mb-2">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Storico Fitness (90 giorni)</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Andamento di Fitness (CTL), Fatica (ATL) e Forma (TSB)</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={last90} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} interval={10} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
            itemStyle={{ fontWeight: 500 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          <ReferenceLine yAxisId="right" y={0} stroke="#9ca3af" strokeDasharray="3 3" />
          <Bar yAxisId="right" dataKey="TSB" maxBarSize={8} name="TSB (Forma)">
             {last90.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.TSB >= 0 ? '#3b82f6' : '#f59e0b'} fillOpacity={0.6} />
            ))}
          </Bar>
          <Line yAxisId="left" type="monotone" dataKey="CTL" name="CTL (Fitness)" stroke="#1D9E75" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          <Line yAxisId="left" type="monotone" dataKey="ATL" name="ATL (Fatica)" stroke="#ef4444" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
