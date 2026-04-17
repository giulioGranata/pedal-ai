'use client';

// CTLATLChart — grafico a linee CTL vs ATL (ultime 8 settimane)
// Client Component necessario per recharts

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { HistoryPoint } from '@/lib/types';
import { formatShortDate } from '@/lib/date';

interface CTLATLChartProps {
  ctlHistory: HistoryPoint[];
  atlHistory: HistoryPoint[];
}

// Descrizioni delle metriche da mostrare nella legenda
const metricInfo = {
  CTL: {
    label: 'CTL',
    color: '#1D9E75',
    title: 'Chronic Training Load',
    description: 'Media ponderata del carico degli ultimi 42 giorni. Rappresenta la tua fitness di base.',
  },
  ATL: {
    label: 'ATL',
    color: '#f59e0b',
    title: 'Acute Training Load',
    description: 'Media ponderata del carico degli ultimi 7 giorni. Rappresenta la fatica accumulata di recente.',
  },
} as const;

type MetricKey = keyof typeof metricInfo;

// Legenda custom con tooltip hover sulle voci
function CustomLegend() {
  const [hovered, setHovered] = useState<MetricKey | null>(null);

  return (
    <div className="flex items-center gap-4 mt-3">
      {(Object.keys(metricInfo) as MetricKey[]).map((key) => {
        const info = metricInfo[key];
        return (
          <div
            key={key}
            className="relative"
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Voce legenda */}
            <div className="flex items-center gap-1.5 cursor-default">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: info.color }}
              />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 select-none">
                {info.label}
              </span>
              {/* Icona info piccola */}
              <span className="text-[10px] text-gray-300 dark:text-gray-600">ⓘ</span>
            </div>

            {/* Tooltip hover */}
            {hovered === key && (
              <div className="absolute bottom-full left-0 mb-2 w-56 z-10 pointer-events-none">
                <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-lg px-3 py-2 shadow-lg">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: info.color }}>
                    {info.title}
                  </p>
                  <p className="text-[11px] text-gray-300 leading-snug">{info.description}</p>
                </div>
                {/* Triangolino */}
                <div
                  className="w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45 ml-3 -mt-1"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Combina i due array di history in un array di oggetti per recharts
function mergeHistories(ctl: HistoryPoint[], atl: HistoryPoint[]) {
  const atlMap = new Map(atl.map((p) => [p.date, p.value]));
  return ctl.map((p) => ({
    date: p.date,
    label: formatShortDate(p.date),
    CTL: p.value,
    ATL: atlMap.get(p.date) ?? null,
  }));
}

// Tooltip personalizzato
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.name}: <span className="font-semibold">{item.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function CTLATLChart({ ctlHistory, atlHistory }: CTLATLChartProps) {
  // Ultimi 56 giorni (8 settimane)
  const last56 = ctlHistory.slice(-56);
  const atlLast56 = atlHistory.slice(-56);
  const data = useMemo(() => mergeHistories(last56, atlLast56), [last56, atlLast56]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          CTL vs ATL — ultime 8 settimane
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          CTL sale con allenamento costante · ATL riflette il carico degli ultimi 7 giorni
        </p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            interval={6}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="CTL"
            stroke={metricInfo.CTL.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="ATL"
            stroke={metricInfo.ATL.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legenda custom con tooltip hover */}
      <CustomLegend />
    </div>
  );
}
