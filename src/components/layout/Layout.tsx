import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="pt-16 md:ml-64 md:pt-0 p-4 md:p-6 lg:p-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
