'use client';

// TSBChart — grafico a barre colorate per TSB (verde/arancio/rosso in base al valore)
// Client Component necessario per recharts

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { HistoryPoint } from '@/lib/types';
import { formatShortDate } from '@/lib/date';

interface TSBChartProps {
  tsbHistory: HistoryPoint[];
}

// Colore barra in base al valore TSB
function getTSBColor(value: number): string {
  if (value > 5) return '#3b82f6';    // blu — in recupero
  if (value >= -10) return '#1D9E75'; // verde — bilanciato
  if (value >= -20) return '#f59e0b'; // arancio — in accumulo
  return '#ef4444';                    // rosso — sovraccarico
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      <p style={{ color: getTSBColor(value) }}>
        TSB: <span className="font-semibold">{value}</span>
      </p>
    </div>
  );
}

export default function TSBChart({ tsbHistory }: TSBChartProps) {
  // Ultimi 30 giorni
  const last30 = tsbHistory.slice(-30).map((p) => ({
    ...p,
    label: formatShortDate(p.date),
  }));

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        TSB — ultimi 30 giorni
      </h2>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={last30} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            interval={6}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Linea di riferimento a 0 */}
          <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="3 3" />
          <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={16}>
            {last30.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getTSBColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
