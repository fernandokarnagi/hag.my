import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLead, useUpdateLead, useDeleteLead } from '@/hooks/useLeads';
import { useToast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LEAD_STATUS_OPTIONS, PIPELINE_STAGES } from '@/types';
import type { LeadStatus } from '@/types';
import { Edit, Trash2, ArrowLeft, MapPin, Phone, Calendar, User } from 'lucide-react';
import { useState } from 'react';

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const [showDelete, setShowDelete] = useState(false);

  async function handleStatusChange(newStatus: LeadStatus) {
    if (!lead) return;
    await updateLead.mutateAsync({ id: lead.id, data: { status: newStatus } });
    toast('Status updated successfully', 'success');
  }

  async function handleDelete() {
    if (!lead) return;
    await deleteLead.mutateAsync(lead.id);
    toast('Lead deleted', 'success');
    navigate('/leads');
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton" />
        <div className="h-24 skeleton rounded-xl" />
        <div className="h-16 skeleton rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-text-secondary">Lead not found</p>
        <Link to="/leads" className="mt-4 text-sm text-accent hover:text-accent-hover">
          Back to Leads
        </Link>
      </div>
    );
  }

  const currentStageIndex = PIPELINE_STAGES.indexOf(lead.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/leads" className="btn-ghost p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text">{lead.clientName}</h1>
          <p className="font-mono text-sm text-text-secondary">{lead.customerCode}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/leads/${lead.id}/edit`} className="btn-secondary">
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          <button onClick={() => setShowDelete(true)} className="btn-danger">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-text-muted">Current Status</label>
            <div className="flex items-center gap-3">
              <span className="badge-info text-sm">{LEAD_STATUS_OPTIONS.find((o) => o.value === lead.status)?.label}</span>
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                disabled={updateLead.isPending}
                className="input-field w-auto"
              >
                {LEAD_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <label className="mb-3 block text-xs font-medium uppercase text-text-muted">Pipeline Progress</label>
        <div className="flex flex-wrap gap-2">
          {PIPELINE_STAGES.map((stage, i) => (
            <div
              key={stage}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                i < currentStageIndex
                  ? 'bg-success/15 text-success border border-success/20'
                  : i === currentStageIndex
                  ? 'bg-accent text-surface shadow-lg shadow-accent/25'
                  : 'bg-surface-lighter text-text-muted border border-border/50'
              }`}
            >
              {LEAD_STATUS_OPTIONS.find((o) => o.value === stage)?.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InfoCard title="Contact Information" icon={Phone}>
          <InfoRow label="Phone" value={lead.contactDetails} />
          <InfoRow label="Location" value={lead.location} />
          <InfoRow label="GPS Pin" value={lead.gpsPin} />
        </InfoCard>

        <InfoCard title="Property Details" icon={MapPin}>
          <InfoRow label="Property Type" value={lead.propertyType} />
          <InfoRow label="Phase" value={lead.phase} />
          <InfoRow label="Avg Monthly Bill" value={lead.avgMonthlyBill ? `RM ${lead.avgMonthlyBill}` : undefined} />
          <InfoRow label="Preferred System" value={lead.preferredSystem} />
        </InfoCard>

        <InfoCard title="Project Details" icon={User}>
          <InfoRow label="Sales Executive" value={lead.salesExecutive} />
          <InfoRow label="Proposal Prepared By" value={lead.proposalPreparedBy} />
          <InfoRow label="Proposed Capacity" value={lead.proposedCapacity ? `${lead.proposedCapacity} kWp` : undefined} />
          <InfoRow label="Project Value" value={lead.projectValue ? `RM ${lead.projectValue}` : undefined} />
        </InfoCard>

        <InfoCard title="Visit Information" icon={Calendar}>
          <InfoRow label="Site Visit Date" value={lead.siteVisitDate?.toDate().toLocaleDateString()} />
          <InfoRow label="Site Visit Done By" value={lead.siteVisitDoneBy} />
          <InfoRow label="Customer Folder" value={lead.customerFolder} />
        </InfoCard>
      </div>

      {lead.remarks && (
        <div className="card p-6">
          <h2 className="mb-3 text-lg font-semibold text-text">Remarks</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{lead.remarks}</p>
        </div>
      )}

      <ConfirmDialog
        open={showDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete ${lead.clientName} (${lead.customerCode})? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}

function InfoCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-surface-lighter p-2">
          <Icon className="h-4 w-4 text-text-muted" />
        </div>
        <h2 className="font-semibold text-text">{title}</h2>
      </div>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-center justify-between py-1">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text">{value || '-'}</dd>
    </div>
  );
}
