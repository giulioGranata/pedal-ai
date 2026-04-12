// Topbar — altezza 52px con logo PedalAI e avatar iniziali GG
// Server Component (nessuna interazione browser richiesta)

export default function Topbar() {
  return (
    <header className="h-[52px] flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2">
        {/* Icona bici stilizzata come accent teal */}
        <span className="text-[#1D9E75] font-bold text-lg tracking-tight">⚡</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100 text-[15px] tracking-tight">
          PedalAI
        </span>
      </div>

      {/* Avatar con iniziali GG */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white select-none"
        style={{ backgroundColor: '#1D9E75' }}
        title="Giulio Granata"
      >
        GG
      </div>
    </header>
  );
}
