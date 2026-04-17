'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Icone SVG inline — nessuna libreria icone
function IconDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// Voci di navigazione principali
const navItems = [
  { href: '/', label: 'Dashboard', icon: IconDashboard },
  { href: '/chat', label: 'Chat AI', icon: IconChat },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={`
        hidden md:flex flex-col
        border-r border-gray-200 dark:border-gray-800
        bg-white dark:bg-gray-950
        transition-all duration-300 ease-in-out
        w-[220px]
        shrink-0 h-full
      `}
    >
      {/* Navigazione principale */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${isActive
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
            >
              <span className="shrink-0"><Icon /></span>
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
