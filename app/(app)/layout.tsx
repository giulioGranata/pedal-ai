import Topbar from '@/components/layout/Topbar';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full bg-background">
      <Topbar />

      {/* Area sotto la topbar: sidebar + main */}
      <div className="flex flex-1 min-h-0">
        <Sidebar />

        {/* Contenuto principale — padding bottom su mobile per BottomNav */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom navigation visibile solo su mobile */}
      <BottomNav />
    </div>
  );
}
