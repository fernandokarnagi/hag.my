import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="pt-16 md:ml-64 md:pt-0 p-4 pr-6 md:p-6 md:pr-8 lg:p-8 lg:pr-10 animate-fade-in overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
