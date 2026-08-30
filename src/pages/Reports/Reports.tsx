import { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { LEAD_STATUS_OPTIONS } from '@/types';
import type { LeadStatus } from '@/types';
import { Download, TrendingUp, BarChart3, MapPin, Home } from 'lucide-react';

export function Reports() {
  const [statusFilter, setStatusFilter] = useState('');
  const [salesFilter, setSalesFilter] = useState('');
  const { data: leads = [], isLoading } = useLeads({ status: (statusFilter as LeadStatus) || undefined, salesExecutive: salesFilter || undefined });

  function exportCSV() {
    const csv = [
      ['Customer Code', 'Client Name', 'Status', 'Contact', 'Sales Exec', 'Location', 'Phase', 'Property', 'System', 'Capacity', 'Value'].join(','),
      ...leads.map((l) => [l.customerCode, `"${l.clientName}"`, l.status, l.contactDetails, l.salesExecutive, l.location, l.phase, l.propertyType, l.preferredSystem, l.proposedCapacity, l.projectValue].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `leads-report-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const statusCounts = LEAD_STATUS_OPTIONS.map((opt) => ({ ...opt, count: leads.filter((l) => l.status === opt.value).length })).filter((s) => s.count > 0);
  const salesExecs = [...new Set(leads.map((l) => l.salesExecutive).filter(Boolean))].sort();
  const locations = [...new Set(leads.map((l) => l.location).filter(Boolean))].sort();
  const propertyTypes = [...new Set(leads.map((l) => l.propertyType).filter(Boolean))].sort();
  const totalRevenue = leads.reduce((sum, l) => { const val = parseFloat(l.projectValue?.replace(/[^0-9.]/g, '') || '0'); return sum + (isNaN(val) ? 0 : val); }, 0);
  const installedRevenue = leads.filter((l) => l.status === 'TURN_ON').reduce((sum, l) => { const val = parseFloat(l.projectValue?.replace(/[^0-9.]/g, '') || '0'); return sum + (isNaN(val) ? 0 : val); }, 0);

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-48 skeleton" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Reports</h1>
          <p className="text-sm text-text-secondary">{leads.length} leads in pipeline</p>
        </div>
        <button onClick={exportCSV} className="btn btn-primary btn-md"><Download className="h-4 w-4" /> Export CSV</button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Status</option>
            {LEAD_STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
          <select value={salesFilter} onChange={(e) => setSalesFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Sales Executives</option>
            {salesExecs.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <div className="rounded-xl bg-accent/10 p-3"><TrendingUp className="h-6 w-6 text-accent" /></div>
          <div><p className="text-sm text-text-secondary">Total Pipeline</p><p className="text-2xl font-bold text-text">RM {totalRevenue.toLocaleString()}</p></div>
        </div>
        <div className="stat-card">
          <div className="rounded-xl bg-success/10 p-3"><BarChart3 className="h-6 w-6 text-success" /></div>
          <div><p className="text-sm text-text-secondary">Installed Revenue</p><p className="text-2xl font-bold text-success">RM {installedRevenue.toLocaleString()}</p></div>
        </div>
        <div className="stat-card">
          <div className="rounded-xl bg-warning/10 p-3"><Home className="h-6 w-6 text-warning" /></div>
          <div><p className="text-sm text-text-secondary">Avg Project Value</p><p className="text-2xl font-bold text-text">RM {leads.length > 0 ? Math.round(totalRevenue / leads.length).toLocaleString() : 0}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportCard title="Leads by Status" icon={BarChart3}>
          {statusCounts.map((s) => <BarRow key={s.value} label={s.label} count={s.count} total={leads.length} />)}
        </ReportCard>
        <ReportCard title="Leads by Sales Executive" icon={TrendingUp}>
          {salesExecs.map((s) => { const count = leads.filter((l) => l.salesExecutive === s).length; return <BarRow key={s} label={s} count={count} total={leads.length} />; })}
        </ReportCard>
        <ReportCard title="Leads by Location" icon={MapPin}>
          {locations.slice(0, 10).map((loc) => { const count = leads.filter((l) => l.location === loc).length; return <BarRow key={loc} label={loc} count={count} total={leads.length} />; })}
        </ReportCard>
        <ReportCard title="Leads by Property Type" icon={Home}>
          {propertyTypes.map((pt) => { const count = leads.filter((l) => l.propertyType === pt).length; return <BarRow key={pt} label={pt!} count={count} total={leads.length} />; })}
        </ReportCard>
      </div>
    </div>
  );
}

function ReportCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="rounded-lg bg-surface-light p-2"><Icon className="h-4 w-4 text-text-muted" /></div>
        <h2 className="font-semibold text-text">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function BarRow({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="group">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-text-secondary truncate max-w-[140px]" title={label}>{label}</span>
        <span className="text-sm font-medium text-text">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-surface-light overflow-hidden">
        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
