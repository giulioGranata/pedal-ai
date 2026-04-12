'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect eseguito solo lato client, previene hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-full max-w-xs"></div>;
  }

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full max-w-xs text-sm font-medium">
      <button
        onClick={() => setTheme('light')}
        className={`flex-1 py-2 text-center rounded-lg transition-colors ${
          theme === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        Chiaro
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`flex-1 py-2 text-center rounded-lg transition-colors ${
          theme === 'system' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        Sistema
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex-1 py-2 text-center rounded-lg transition-colors ${
          theme === 'dark' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        Scuro
      </button>
    </div>
  );
}
