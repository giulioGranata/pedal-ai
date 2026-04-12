import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/layout/ThemeProvider';
import Topbar from '@/components/layout/Topbar';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

// Font di sistema — Geist (system font stack ottimale)
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PedalAI — Dashboard ciclismo',
  description: 'Dashboard personale per il monitoraggio dell\'allenamento ciclistico con AI coaching integrato.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning necessario per next-themes (class="dark" aggiunta lato client)
    <html
      lang="it"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="h-full antialiased bg-background text-foreground">
        <ThemeProvider>
          {/* Layout principale: colonna con topbar + area contenuto */}
          <div className="flex flex-col h-full">
            <Topbar />

            {/* Area sotto la topbar: sidebar + main */}
            <div className="flex flex-1 min-h-0">
              <Sidebar />

              {/* Contenuto principale — padding bottom su mobile per BottomNav */}
              <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
                {children}
              </main>
            </div>
          </div>

          {/* Bottom navigation visibile solo su mobile */}
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
