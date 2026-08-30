import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLead, useUpdateLead, useDeleteLead } from '@/hooks/useLeads';
import { useAuthContext } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LEAD_STATUS_OPTIONS, PIPELINE_STAGES } from '@/types';
import type { LeadStatus } from '@/types';
import { Edit, Trash2, ArrowLeft, MapPin, Phone, Calendar, User, History, Save, ChevronDown, ChevronUp, MessageSquare, ClipboardList } from 'lucide-react';
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
  const [selectedStages, setSelectedStages] = useState<Set<string>>(new Set());
  const [hasStageChanges, setHasStageChanges] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    contact: true,
    property: true,
    project: true,
    visit: true,
    stages: true,
    history: false,
    remarks: true,
  });

  const canEdit = hasPermission(userProfile?.role, 'canEditLead');
  const canDelete = hasPermission(userProfile?.role, 'canDeleteLead');

  useEffect(() => {
    if (lead) {
      setSelectedStages(new Set(lead.completedStages || []));
    }
  }, [lead]);

  useEffect(() => {
    if (id) {
      getAuditLogs(id).then(setAuditLogs);
    }
  }, [id]);

  function togglePanel(panel: string) {
    setExpandedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  }

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
    setHasStageChanges(true);
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
    setHasStageChanges(false);
    toast('Stages updated', 'success');
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton" />)}
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

  const completedCount = selectedStages.size;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link to="/leads" className="btn btn-ghost btn-sm p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text">{lead.clientName}</h1>
          <p className="font-mono text-sm text-text-secondary">{lead.customerCode}</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Furthest Stage Badge */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="badge-success text-sm">
              {LEAD_STATUS_OPTIONS.find((o) => o.value === lead.status)?.label || lead.status}
            </span>
            <span className="text-xs text-text-muted">
              {completedCount} of {PIPELINE_STAGES.length} stages
            </span>
          </div>
          {lead.remarks && (
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <MessageSquare className="h-3 w-3" /> Has comment
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Stages */}
      <CollapsiblePanel title="Pipeline Stages" icon={<ClipboardList className="h-4 w-4" />} expanded={expandedPanels.stages} onToggle={() => togglePanel('stages')} badge={`${completedCount}/${PIPELINE_STAGES.length}`}>
        <div className="flex flex-wrap gap-2 mb-4">
          {PIPELINE_STAGES.map((stage) => {
            const isDone = isStageDone(stage);
            return (
              <label
                key={stage}
                className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition-all ${
                  isDone ? 'border-success bg-success/10' : 'border-border hover:border-text-muted'
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
        {canEdit && hasStageChanges && (
          <button onClick={handleSaveStages} disabled={updateLead.isPending} className="btn btn-primary btn-md">
            <Save className="h-4 w-4" /> {updateLead.isPending ? 'Saving...' : 'Save Stages'}
          </button>
        )}
      </CollapsiblePanel>

      {/* Contact Information */}
      <CollapsiblePanel title="Contact Information" icon={<Phone className="h-4 w-4" />} expanded={expandedPanels.contact} onToggle={() => togglePanel('contact')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoRow label="Phone" value={lead.contactDetails} />
          <InfoRow label="Location" value={lead.location} />
          <InfoRow label="GPS Pin" value={lead.gpsPin} />
        </div>
      </CollapsiblePanel>

      {/* Property Details */}
      <CollapsiblePanel title="Property Details" icon={<MapPin className="h-4 w-4" />} expanded={expandedPanels.property} onToggle={() => togglePanel('property')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoRow label="Property Type" value={lead.propertyType} />
          <InfoRow label="Phase" value={lead.phase} />
          <InfoRow label="Avg Monthly Bill" value={lead.avgMonthlyBill ? `RM ${lead.avgMonthlyBill}` : undefined} />
          <InfoRow label="Preferred System" value={lead.preferredSystem} />
        </div>
      </CollapsiblePanel>

      {/* Project Details */}
      <CollapsiblePanel title="Project Details" icon={<User className="h-4 w-4" />} expanded={expandedPanels.project} onToggle={() => togglePanel('project')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoRow label="Sales Executive" value={lead.salesExecutive} />
          <InfoRow label="Proposal Prepared By" value={lead.proposalPreparedBy} />
          <InfoRow label="Proposed Capacity" value={lead.proposedCapacity ? `${lead.proposedCapacity} kWp` : undefined} />
          <InfoRow label="Project Value" value={lead.projectValue ? `RM ${lead.projectValue}` : undefined} />
        </div>
      </CollapsiblePanel>

      {/* Visit Information */}
      <CollapsiblePanel title="Visit Information" icon={<Calendar className="h-4 w-4" />} expanded={expandedPanels.visit} onToggle={() => togglePanel('visit')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoRow label="Site Visit Date" value={lead.siteVisitDate?.toDate().toLocaleDateString()} />
          <InfoRow label="Site Visit Done By" value={lead.siteVisitDoneBy} />
          <InfoRow label="Customer Folder" value={lead.customerFolder} />
        </div>
      </CollapsiblePanel>

      {/* Remarks */}
      <CollapsiblePanel title="Remarks" icon={<MessageSquare className="h-4 w-4" />} expanded={expandedPanels.remarks} onToggle={() => togglePanel('remarks')}>
        {lead.remarks ? (
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{lead.remarks}</p>
        ) : (
          <p className="text-sm text-text-muted italic">No remarks</p>
        )}
      </CollapsiblePanel>

      {/* Change History */}
      <CollapsiblePanel title={`Change History (${auditLogs.length})`} icon={<History className="h-4 w-4" />} expanded={expandedPanels.history} onToggle={() => togglePanel('history')}>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-text-muted">No changes recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 border-b border-border-light pb-3 last:border-0">
                <div className="rounded-full bg-surface-light p-2 mt-0.5">
                  <History className="h-4 w-4 text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text">
                    <span className="font-medium">{log.userName}</span>
                    {' '}
                    {log.action === 'create' && 'created this lead'}
                    {log.action === 'delete' && 'deleted this lead'}
                    {log.action === 'status_change' && (
                      <>changed <span className="font-medium">{log.field}</span> from <span className="badge-neutral text-xs">{log.oldValue || 'none'}</span> to <span className="badge-info text-xs">{log.newValue}</span></>
                    )}
                    {log.action === 'update' && log.field !== 'status' && (
                      <>updated <span className="font-medium">{log.field}</span></>
                    )}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {log.timestamp?.toDate().toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsiblePanel>

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

function CollapsiblePanel({ title, icon, expanded, onToggle, children, badge }: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-light/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="text-text-muted">{icon}</div>
          <h3 className="font-semibold text-text">{title}</h3>
          {badge && <span className="text-xs text-text-muted">({badge})</span>}
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-text-muted" /> : <ChevronDown className="h-5 w-5 text-text-muted" />}
      </button>
      {expanded && <div className="px-4 pb-4 border-t border-border">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-text-muted mb-1">{label}</dt>
      <dd className="text-sm font-medium text-text">{value || '-'}</dd>
    </div>
  );
}
