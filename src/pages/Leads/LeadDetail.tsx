import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLead, useUpdateLead, useDeleteLead } from '@/hooks/useLeads';
import { useAuthContext } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LEAD_STATUS_OPTIONS, PIPELINE_STAGES } from '@/types';
import type { LeadStatus } from '@/types';
import { Edit, Trash2, ArrowLeft, MapPin, Phone, Calendar, User, History, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAuditLogs, type AuditLog } from '@/services/auditService';
import { hasPermission } from '@/lib/permissions';

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useAuthContext();
  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const [showDelete, setShowDelete] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [selectedStages, setSelectedStages] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const canEdit = hasPermission(userProfile?.role, 'canEditLead');
  const canDelete = hasPermission(userProfile?.role, 'canDeleteLead');
  const canViewAudit = hasPermission(userProfile?.role, 'canViewAuditLog');

  useEffect(() => {
    if (lead) {
      setSelectedStages(new Set(lead.completedStages || []));
    }
  }, [lead]);

  useEffect(() => {
    if (id && showAudit) {
      getAuditLogs(id).then(setAuditLogs);
    }
  }, [id, showAudit]);

  function isStageDone(stage: string): boolean {
    return selectedStages.has(stage);
  }

  function handleStageToggle(stage: string) {
    setSelectedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) {
        next.delete(stage);
      } else {
        next.add(stage);
      }
      return next;
    });
    setHasChanges(true);
  }

  function getHighestStage(stages: Set<string>): LeadStatus {
    for (let i = PIPELINE_STAGES.length - 1; i >= 0; i--) {
      if (stages.has(PIPELINE_STAGES[i])) {
        return PIPELINE_STAGES[i];
      }
    }
    return 'GOOGLE_FORM-INCOMING';
  }

  async function handleSaveStages() {
    if (!lead || !userProfile) return;
    const newStatus = getHighestStage(selectedStages);
    await updateLead.mutateAsync({
      id: lead.id,
      data: { status: newStatus, completedStages: Array.from(selectedStages) },
      userId: userProfile.uid,
      userName: userProfile.displayName,
      oldData: { status: lead.status, completedStages: lead.completedStages },
    });
    setHasChanges(false);
    toast('Stages updated', 'success');
  }

  async function handleStatusChange(newStatus: LeadStatus) {
    if (!lead || !userProfile) return;
    await updateLead.mutateAsync({
      id: lead.id,
      data: { status: newStatus },
      userId: userProfile.uid,
      userName: userProfile.displayName,
      oldData: { status: lead.status },
    });
    toast('Status updated successfully', 'success');
  }

  async function handleDelete() {
    if (!lead || !userProfile) return;
    await deleteLead.mutateAsync({
      id: lead.id,
      customerCode: lead.customerCode,
      userId: userProfile.uid,
      userName: userProfile.displayName,
    });
    toast('Lead deleted', 'success');
    navigate('/leads');
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton" />
        <div className="h-24 skeleton" />
        <div className="h-16 skeleton" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-48 skeleton" />)}
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-text-secondary">Lead not found</p>
        <Link to="/leads" className="mt-4 text-sm text-accent hover:text-accent-hover">Back to Leads</Link>
      </div>
    );
  }

  const currentStageIndex = PIPELINE_STAGES.indexOf(lead.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/leads" className="btn btn-ghost btn-sm p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text">{lead.clientName}</h1>
          <p className="font-mono text-sm text-text-secondary">{lead.customerCode}</p>
        </div>
        <div className="flex items-center gap-2">
          {canViewAudit && (
            <button onClick={() => setShowAudit(!showAudit)} className="btn btn-ghost btn-md">
              <History className="h-4 w-4" />
              {showAudit ? 'Hide' : 'Audit'}
            </button>
          )}
          {canEdit && (
            <Link to={`/leads/${lead.id}/edit`} className="btn btn-secondary btn-md">
              <Edit className="h-4 w-4" /> Edit
            </Link>
          )}
          {canDelete && (
            <button onClick={() => setShowDelete(true)} className="btn btn-outline-danger btn-md">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-text-muted">Current Status</label>
            <div className="flex items-center gap-3">
              <span className="badge-info text-sm">{LEAD_STATUS_OPTIONS.find((o) => o.value === lead.status)?.label}</span>
              {canEdit && (
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
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs font-medium uppercase text-text-muted">Pipeline Stages</label>
          {canEdit && hasChanges && (
            <button onClick={handleSaveStages} disabled={updateLead.isPending} className="btn btn-primary btn-sm">
              <Save className="h-3 w-3" /> {updateLead.isPending ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {PIPELINE_STAGES.map((stage) => {
            const isDone = isStageDone(stage);
            return (
              <label
                key={stage}
                className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-all ${
                  isDone
                    ? 'border-success bg-success/10'
                    : 'border-border hover:border-text-muted'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => handleStageToggle(stage)}
                  disabled={!canEdit}
                  className="h-4 w-4 rounded border-gray-300 text-success focus:ring-success"
                />
                <span className={`text-sm ${isDone ? 'text-success font-medium' : 'text-text-secondary'}`}>
                  {LEAD_STATUS_OPTIONS.find((o) => o.value === stage)?.label || stage}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {showAudit && (
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-text-muted" />
            <h2 className="font-semibold text-text">Audit History</h2>
          </div>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-text-secondary">No audit records yet.</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 border-b border-border-light pb-3 last:border-0">
                  <div className="rounded-full bg-surface-light p-2">
                    <History className="h-4 w-4 text-text-muted" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text">
                      <span className="font-medium">{log.userName}</span>
                      {' '}
                      {log.action === 'create' && 'created this lead'}
                      {log.action === 'delete' && 'deleted this lead'}
                      {log.action === 'status_change' && (
                        <>changed <span className="font-medium">{log.field}</span> from <span className="badge-neutral text-xs">{log.oldValue || 'none'}</span> to <span className="badge-info text-xs">{log.newValue}</span></>
                      )}
                      {log.action === 'update' && log.field !== 'status' && (
                        <>updated <span className="font-medium">{log.field}</span> from <span className="text-text-muted">{log.oldValue || 'empty'}</span> to <span className="text-text">{log.newValue}</span></>
                      )}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {log.timestamp?.toDate().toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
        <div className="rounded-lg bg-surface-light p-2"><Icon className="h-4 w-4 text-text-muted" /></div>
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
