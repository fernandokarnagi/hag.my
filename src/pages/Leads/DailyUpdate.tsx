import { useState } from 'react';
import { useLeads, useUpdateLead } from '@/hooks/useLeads';
import { useAuthContext } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { PIPELINE_STAGES, LEAD_STATUS_OPTIONS } from '@/types';
import type { LeadStatus } from '@/types';
import { Save, RotateCcw, ClipboardList, MessageSquare, X } from 'lucide-react';

export function DailyUpdate() {
  const { toast } = useToast();
  const { userProfile } = useAuthContext();
  const { data: leads = [], isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const [dotOverrides, setDotOverrides] = useState<Record<string, Record<string, boolean>>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [salesFilter, setSalesFilter] = useState('');
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const filteredLeads = leads.filter((l) => {
    if (search) {
      const s = search.toLowerCase();
      if (!l.clientName.toLowerCase().includes(s) && !l.customerCode.toLowerCase().includes(s)) return false;
    }
    if (salesFilter && l.salesExecutive !== salesFilter) return false;
    return true;
  });

  function isDotDone(leadId: string, stage: string, completedStages?: string[]): boolean {
    if (dotOverrides[leadId] && stage in dotOverrides[leadId]) {
      return dotOverrides[leadId][stage];
    }
    return completedStages?.includes(stage) || false;
  }

  function handleDotClick(leadId: string, stage: string) {
    setDotOverrides((prev) => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        [stage]: !isDotDone(leadId, stage),
      },
    }));
  }

  function getSelectedStages(leadId: string, completedStages?: string[]): string[] {
    const overrides = dotOverrides[leadId] || {};
    if (Object.keys(overrides).length > 0) {
      return Object.keys(overrides).filter((s) => overrides[s]);
    }
    return completedStages || [];
  }

  function getHighestStage(stages: string[]): LeadStatus {
    for (let i = PIPELINE_STAGES.length - 1; i >= 0; i--) {
      if (stages.includes(PIPELINE_STAGES[i])) {
        return PIPELINE_STAGES[i];
      }
    }
    return 'GOOGLE_FORM-INCOMING';
  }

  function openCommentModal(leadId: string) {
    setSelectedLeadId(leadId);
    setShowCommentModal(true);
  }

  function saveComment() {
    if (selectedLeadId && comments[selectedLeadId] !== undefined) {
      setShowCommentModal(false);
      setSelectedLeadId(null);
    }
  }

  async function handleSave() {
    if (!userProfile) return;
    const updates = Object.keys(dotOverrides).map((leadId) => {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return null;
      const selectedStages = getSelectedStages(leadId, lead.completedStages);
      const newStatus = getHighestStage(selectedStages);
      const newComment = comments[leadId];
      const hasStatusChange = newStatus !== lead.status;
      const hasCommentChange = newComment !== undefined && newComment !== (lead.remarks || '');
      if (!hasStatusChange && !hasCommentChange) return null;
      const data: any = {};
      if (hasStatusChange) {
        data.status = newStatus;
        data.completedStages = selectedStages;
      }
      if (hasCommentChange) {
        data.remarks = newComment;
      }
      return {
        id: leadId,
        data,
        userId: userProfile.uid,
        userName: userProfile.displayName,
        oldData: { status: lead.status, customerCode: lead.customerCode, remarks: lead.remarks },
      };
    }).filter(Boolean);

    if (updates.length === 0) {
      toast('No changes to save', 'info');
      return;
    }

    try {
      await Promise.all(updates.map((u) => updateLead.mutateAsync(u!)));
      setDotOverrides({});
      setComments({});
      toast(`${updates.length} leads updated`, 'success');
    } catch {
      toast('Failed to save', 'error');
    }
  }

  const hasChanges = Object.keys(dotOverrides).length > 0 || Object.keys(comments).length > 0;
  const salesExecs = [...new Set(leads.map((l) => l.salesExecutive).filter(Boolean))].sort();
  const selectedLead = selectedLeadId ? leads.find((l) => l.id === selectedLeadId) : null;

  if (isLoading) return <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 skeleton" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Daily Update</h1>
          <p className="text-sm text-text-secondary">Click dots to toggle, click comment icon to add remarks</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <button onClick={() => { setDotOverrides({}); setComments({}); }} className="btn btn-secondary btn-md"><RotateCcw className="h-4 w-4" /> Reset</button>
              <button onClick={handleSave} disabled={updateLead.isPending} className="btn btn-primary btn-md"><Save className="h-4 w-4" /> {updateLead.isPending ? 'Saving...' : 'Save'}</button>
            </>
          )}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3">
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field flex-[3]" />
          <select value={salesFilter} onChange={(e) => setSalesFilter(e.target.value)} className="input-field flex-1">
            <option value="">All Sales Executives</option>
            {salesExecs.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-surface-light">
                <th className="sticky left-0 z-10 bg-surface-light px-3 py-3 text-left text-xs font-medium uppercase text-text-muted min-w-[100px]">Code</th>
                <th className="sticky left-[100px] z-10 bg-surface-light px-3 py-3 text-left text-xs font-medium uppercase text-text-muted min-w-[130px]">Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase text-text-muted min-w-[90px]">Sales Exec</th>
                <th className="px-3 py-3 text-center text-xs font-medium uppercase text-text-muted min-w-[50px]">Note</th>
                {PIPELINE_STAGES.map((stage) => {
                  const label = LEAD_STATUS_OPTIONS.find((o) => o.value === stage)?.label || stage;
                  return (
                    <th
                      key={stage}
                      className="px-1 py-3 text-center text-[10px] font-medium uppercase text-text-muted cursor-help"
                      style={{ minWidth: '40px', writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                      onMouseEnter={() => setHoveredStage(stage)}
                      onMouseLeave={() => setHoveredStage(null)}
                    >
                      {label?.slice(0, 10)}
                      {hoveredStage === stage && (
                        <div className="fixed z-[100] px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg pointer-events-none" style={{ top: '10px', left: '50%', transform: 'translateX(-50%)' }}>
                          {label}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={4 + PIPELINE_STAGES.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-4 rounded-full bg-surface-light p-4"><ClipboardList className="h-8 w-8 text-text-muted" /></div>
                      <p className="text-text-secondary">No leads found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="table-row">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2.5 text-xs font-mono font-medium border-r border-border">{lead.customerCode}</td>
                    <td className="sticky left-[100px] z-10 bg-white px-3 py-2.5 text-xs border-r border-border">{lead.clientName}</td>
                    <td className="px-3 py-2.5 text-xs text-text-secondary">{lead.salesExecutive || '-'}</td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => openCommentModal(lead.id)}
                        className={`p-1 rounded transition-colors ${comments[lead.id] !== undefined ? 'text-accent bg-accent/10' : lead.remarks ? 'text-success' : 'text-text-muted hover:text-text'}`}
                        title={lead.remarks || 'Add comment'}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </td>
                    {PIPELINE_STAGES.map((stage) => {
                      const done = isDotDone(lead.id, stage, lead.completedStages);
                      return (
                        <td key={stage} className="px-1 py-2.5 text-center">
                          <button
                            onClick={() => handleDotClick(lead.id, stage)}
                            className={`h-5 w-5 rounded-full border-2 transition-all duration-150 ${
                              done
                                ? 'border-success bg-success'
                                : 'border-border hover:border-text-muted hover:scale-110'
                            }`}
                            title={`${lead.clientName} → ${LEAD_STATUS_OPTIONS.find((o) => o.value === stage)?.label}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-6 text-xs text-text-muted">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-success" /> Selected</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border-2 border-border" /> Not selected</span>
        <span className="flex items-center gap-2"><MessageSquare className="h-3 w-3" /> Comment</span>
      </div>

      {showCommentModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 animate-fade-in" onClick={() => setShowCommentModal(false)} />
          <div className="relative w-full max-w-lg animate-scale-in">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-text">Comment / Remark</h2>
                  <p className="text-sm text-text-secondary">{selectedLead.clientName} ({selectedLead.customerCode})</p>
                </div>
                <button onClick={() => setShowCommentModal(false)} className="text-text-muted hover:text-text"><X className="h-5 w-5" /></button>
              </div>
              <textarea
                value={comments[selectedLeadId!] !== undefined ? comments[selectedLeadId!] : selectedLead.remarks || ''}
                onChange={(e) => setComments({ ...comments, [selectedLeadId!]: e.target.value })}
                className="input-field resize-none"
                rows={5}
                placeholder="Add your comment or remark..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setShowCommentModal(false)} className="btn btn-secondary btn-md">Cancel</button>
                <button onClick={saveComment} className="btn btn-primary btn-md">Save Comment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
