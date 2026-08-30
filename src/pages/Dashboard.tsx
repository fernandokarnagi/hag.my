import { Link } from 'react-router-dom';
import { useLeads } from '@/hooks/useLeads';
import { LEAD_STATUS_OPTIONS } from '@/types';
import {
  Users,
  ClipboardList,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Sun,
  Battery,
} from 'lucide-react';

export function Dashboard() {
  const { data: leads = [], isLoading } = useLeads({ limit: 100 });

  const statusCounts = LEAD_STATUS_OPTIONS.map((opt) => ({
    ...opt,
    count: leads.filter((l) => l.status === opt.value).length,
  })).filter((s) => s.count > 0);

  const totalLeads = leads.length;
  const installedLeads = leads.filter((l) => l.status === 'TURN_ON').length;
  const conversionRate = totalLeads > 0 ? ((installedLeads / totalLeads) * 100).toFixed(1) : '0';

  const upcomingSiteVisits = leads
    .filter((l) => l.siteVisitDate && l.status === 'SITE_VISIT')
    .sort((a, b) => (a.siteVisitDate?.toMillis() || 0) - (b.siteVisitDate?.toMillis() || 0))
    .slice(0, 5);

  const totalRevenue = leads.reduce((sum, l) => {
    const val = parseFloat(l.projectValue?.replace(/[^0-9.]/g, '') || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-sm text-text-secondary">Welcome back. Here's your pipeline overview.</p>
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <Sun className="h-5 w-5 text-warning" />
          <span className="text-sm">Sabah, Malaysia</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Leads"
          value={totalLeads}
          color="blue"
          trend="+12%"
        />
        <StatCard
          icon={ClipboardList}
          label="Installed"
          value={installedLeads}
          color="green"
          trend={`${conversionRate}%`}
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion"
          value={`${conversionRate}%`}
          color="purple"
        />
        <StatCard
          icon={Battery}
          label="Pipeline Value"
          value={`RM ${(totalRevenue / 1000).toFixed(0)}k`}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Leads by Status</h2>
            <Link to="/leads" className="text-sm text-accent hover:text-accent-hover flex items-center gap-1">
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {statusCounts.slice(0, 8).map((s) => (
              <div key={s.value} className="group">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{s.label}</span>
                  <span className="text-sm font-medium text-text">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-light overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-green-500 transition-all duration-500"
                    style={{ width: `${(s.count / totalLeads) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Upcoming Visits</h2>
            <Calendar className="h-5 w-5 text-text-muted" />
          </div>
          {upcomingSiteVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 rounded-full bg-surface-light p-3">
                <Calendar className="h-6 w-6 text-text-muted" />
              </div>
              <p className="text-sm text-text-secondary">No upcoming visits</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSiteVisits.map((lead) => (
                <Link
                  key={lead.id}
                  to={`/leads/${lead.id}`}
                  className="group flex items-center justify-between rounded-lg border border-border p-3 transition-all duration-200 hover:border-accent/30 hover:bg-surface-light"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold text-accent">
                      {lead.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                        {lead.clientName}
                      </p>
                      <p className="text-xs text-text-muted">{lead.location}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Recent Leads</h2>
          <Link to="/leads" className="text-sm text-accent hover:text-accent-hover flex items-center gap-1">
            View All <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-xs font-medium uppercase text-text-muted">Code</th>
                <th className="pb-3 text-left text-xs font-medium uppercase text-text-muted">Name</th>
                <th className="pb-3 text-left text-xs font-medium uppercase text-text-muted">Status</th>
                <th className="pb-3 text-left text-xs font-medium uppercase text-text-muted">Location</th>
                <th className="pb-3 text-left text-xs font-medium uppercase text-text-muted">Value</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id} className="table-row">
                  <td className="py-3">
                    <Link to={`/leads/${lead.id}`} className="font-mono text-sm text-accent hover:text-accent-hover">
                      {lead.customerCode}
                    </Link>
                  </td>
                  <td className="py-3 text-sm text-text">{lead.clientName}</td>
                  <td className="py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="py-3 text-sm text-text-secondary">{lead.location || '-'}</td>
                  <td className="py-3 text-sm font-medium text-text">
                    {lead.projectValue ? `RM ${lead.projectValue}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  trend?: string;
}) {
  const colors: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-info/10', icon: 'text-info' },
    green: { bg: 'bg-success/10', icon: 'text-success' },
    purple: { bg: 'bg-purple-100', icon: 'text-purple-600' },
    amber: { bg: 'bg-warning/10', icon: 'text-warning' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className="stat-card">
      <div className={`rounded-xl p-3 ${c.bg}`}>
        <Icon className={`h-6 w-6 ${c.icon}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-text-secondary">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-text">{value}</p>
          {trend && (
            <span className="text-xs font-medium text-success">{trend}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = LEAD_STATUS_OPTIONS.find((o) => o.value === status)?.label || status;

  if (status === 'TURN_ON' || status === 'INSTALLATION_DONE') {
    return <span className="badge-success">{label}</span>;
  }
  if (status === 'NO_RESPONSE') {
    return <span className="badge-neutral">{label}</span>;
  }
  if (status === 'SITE_VISIT' || status === 'PROPOSAL_QUOTATION') {
    return <span className="badge-warning">{label}</span>;
  }
  return <span className="badge-info">{label}</span>;
}
