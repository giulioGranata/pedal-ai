// StatusBar — banner in cima alla dashboard con suggerimento del giorno
// Server Component, testo statico per ora (sarà collegato all'AI in seguito)

interface StatusBarProps {
  tsb: number;
  atl: number;
  ctl: number;
}

// Determina il messaggio e il colore in base ai valori di forma
function getStatus(tsb: number, atl: number, ctl: number): {
  message: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
} {
  if (tsb < -15) {
    return {
      message: `Carico elevato — TSB a ${tsb}. Considera una giornata di recupero attivo o riposo.`,
      color: 'text-red-700 dark:text-red-300',
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      dot: 'bg-red-500',
    };
  }
  if (tsb >= -5 && tsb <= 5) {
    return {
      message: `Forma bilanciata — TSB a ${tsb}. Ottimo per allenamenti di qualità o gare.`,
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
    };
  }
  if (tsb > 10) {
    return {
      message: `In recupero — TSB a ${tsb}. Corpo ricaricato, perfetto per un'uscita intensa.`,
      color: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      dot: 'bg-blue-500',
    };
  }
  return {
    message: `In accumulo — TSB a ${tsb}, CTL ${ctl}, ATL ${atl}. Continua a costruire la base aerobica.`,
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  };
}

export default function StatusBar({ tsb, atl, ctl }: StatusBarProps) {
  const status = getStatus(tsb, atl, ctl);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${status.bg} ${status.border} ${status.color}`}>
      {/* Indicatore colorato pulsante */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${status.dot}`} />
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status.dot}`} />
      </span>
      <span>{status.message}</span>
    </div>
  );
}
