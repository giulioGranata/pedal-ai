'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Appena loggato, naviga alla dashboard ricaricando il router
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Autenticazione fallita');
      }
    } catch (err) {
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-[#09090b]">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-sm p-8 shadow-sm">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#1D9E75] text-2xl">
            ⚡
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">PedalAI</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard Coach Ciclismo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Inserisci la password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/50 focus:border-[#1D9E75] transition-all dark:text-gray-200"
              required
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-xs font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#1D9E75] hover:bg-[#15805e] text-white rounded-lg px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Accesso in corso...' : 'Entra'}
          </button>
        </form>

      </div>
    </div>
  );
}
