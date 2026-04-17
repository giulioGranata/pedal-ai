'use client';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="rounded-xl border border-red-900/40 bg-red-950/30 p-6">
        <h2 className="text-lg font-semibold text-red-200">Errore nel caricamento dashboard</h2>
        <p className="mt-2 text-sm text-red-100/80">
          {error.message || 'Si e verificato un problema imprevisto nel recupero dati.'}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}
