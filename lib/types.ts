// Tipi TypeScript per i dati dell'atleta — pedal-ai

export interface HistoryPoint {
  date: string;
  value: number;
}

export interface WellnessPoint {
  date: string;
  hrv: number | null;
  resting_hr: number | null;
  sleep_hours: number | null;
  energy: number | null;
}

export interface FitnessData {
  ctl: number;
  atl: number;
  tsb: number;
  ctl_history: HistoryPoint[];
  atl_history: HistoryPoint[];
  tsb_history: HistoryPoint[];
}

export interface WellnessData {
  hrv: number;
  resting_hr: number;
  sleep_hours: number;
  energy: number;
  history?: WellnessPoint[];
}

export interface Activity {
  id: string;
  date: string;
  name: string;
  duration_seconds: number;
  distance_meters: number;
  normalized_power: number;
  intensity_factor: number;
  tss: number;
  type: string;
}

export interface Athlete {
  id: string;
  name: string;
}

export interface AthleteData {
  updated_at: string;
  athlete: Athlete;
  fitness: FitnessData;
  wellness: WellnessData;
  activities: Activity[];
}

// Tipo per i messaggi della chat
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Tipo per i grafici inline generati dall'AI
export interface ChartData {
  type: 'chart';
  chartType: 'line' | 'bar';
  title: string;
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
}
