import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeads } from '@/hooks/useLeads';
import { useAuthContext } from '@/components/AuthProvider';
import { LEAD_STATUS_OPTIONS, PROPERTY_TYPE_OPTIONS } from '@/types';
import type { LeadStatus } from '@/types';
import { Plus, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { hasPermission } from '@/lib/permissions';

const PAGE_SIZE = 20;

export function LeadList() {
  const { userProfile } = useAuthContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [page, setPage] = useState(1);

  const canCreate = hasPermission(userProfile?.role, 'canCreateLead');
  const canViewAll = hasPermission(userProfile?.role, 'canViewAllLeads');

  const { data: allLeads = [], isLoading } = useLeads({
    status: (statusFilter as LeadStatus) || undefined,
    propertyType: propertyFilter || undefined,
    createdBy: !canViewAll ? userProfile?.uid : undefined,
  });

  const filteredLeads = search
    ? allLeads.filter(
        (l) =>
          l.clientName.toLowerCase().includes(search.toLowerCase()) ||
          l.customerCode.toLowerCase().includes(search.toLowerCase()) ||
          l.contactDetails.includes(search) ||
          l.location.toLowerCase().includes(search.toLowerCase())
      )
    : allLeads;

  const totalPages = Math.ceil(filteredLeads.length / PAGE_SIZE);
  const paginatedLeads = filteredLeads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Leads</h1>
          <p className="text-sm text-text-secondary">{filteredLeads.length} total leads</p>
        </div>
        {canCreate && (
          <Link to="/leads/new" className="btn btn-primary btn-md shrink-0">
            <Plus className="h-4 w-4" />
            <span>New Lead</span>
          </Link>
        )}
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field flex-1 min-w-0"
          />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Status</option>
            {LEAD_STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
          <select value={propertyFilter} onChange={(e) => { setPropertyFilter(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Property Types</option>
            {PROPERTY_TYPE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 skeleton" />)}
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-light">
                  <th className="px-4 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Code</th>
                  <th className="px-4 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Name</th>
                  <th className="px-4 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Status</th>
                  <th className="px-4 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Sales Exec</th>
                  <th className="px-4 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Location</th>
                  <th className="px-4 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Phase</th>
                  <th className="px-4 py-3.5 text-left text-xs font-medium uppercase text-text-muted">Property</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="mb-4 rounded-full bg-surface-light p-4"><Users className="h-8 w-8 text-text-muted" /></div>
                        <p className="text-text-secondary">No leads found</p>
                        <p className="text-sm text-text-muted">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => (
                    <tr key={lead.id} className="table-row">
                      <td className="px-4 py-3">
                        <Link to={`/leads/${lead.id}`} className="font-mono text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                          {lead.customerCode}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-text">{lead.clientName}</td>
                      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{lead.salesExecutive || '-'}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{lead.location || '-'}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{lead.phase || '-'}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{lead.propertyType || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary btn-sm disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-secondary btn-sm disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = LEAD_STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
  if (status === 'TURN_ON' || status === 'INSTALLATION_DONE') return <span className="badge-success">{label}</span>;
  if (status === 'NO_RESPONSE') return <span className="badge-neutral">{label}</span>;
  if (status === 'SITE_VISIT' || status === 'PROPOSAL_QUOTATION') return <span className="badge-warning">{label}</span>;
  return <span className="badge-info">{label}</span>;
}
