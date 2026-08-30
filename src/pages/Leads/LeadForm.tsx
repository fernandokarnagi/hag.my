import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLead, useCreateLead, useUpdateLead, useNextCustomerCode } from '@/hooks/useLeads';
import { useAuthContext } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { LEAD_STATUS_OPTIONS, PROPERTY_TYPE_OPTIONS, PHASE_OPTIONS, PREFERRED_SYSTEM_OPTIONS } from '@/types';
import type { LeadStatus } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';

export function LeadForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useAuthContext();
  const { data: existingLead, isLoading: leadLoading } = useLead(id);
  const { data: nextCode } = useNextCustomerCode();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    clientName: '', status: 'GOOGLE_FORM-INCOMING' as LeadStatus, contactDetails: '',
    siteVisitDoneBy: '', salesExecutive: '', proposalPreparedBy: '', phase: '',
    avgMonthlyBill: '', preferredSystem: '', propertyType: '', proposedCapacity: '',
    projectValue: '', location: '', gpsPin: '', customerFolder: '', remarks: '',
  });

  useEffect(() => {
    if (existingLead) {
      setForm({
        clientName: existingLead.clientName, status: existingLead.status,
        contactDetails: existingLead.contactDetails, siteVisitDoneBy: existingLead.siteVisitDoneBy,
        salesExecutive: existingLead.salesExecutive, proposalPreparedBy: existingLead.proposalPreparedBy,
        phase: existingLead.phase, avgMonthlyBill: existingLead.avgMonthlyBill,
        preferredSystem: existingLead.preferredSystem, propertyType: existingLead.propertyType || '',
        proposedCapacity: existingLead.proposedCapacity, projectValue: existingLead.projectValue,
        location: existingLead.location, gpsPin: existingLead.gpsPin,
        customerFolder: existingLead.customerFolder, remarks: existingLead.remarks,
      });
    }
  }, [existingLead]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userProfile) return;

    try {
      if (isEdit && id) {
        await updateLead.mutateAsync({
          id, data: form as any,
          userId: userProfile.uid, userName: userProfile.displayName,
          oldData: existingLead || undefined,
        });
        toast('Lead updated successfully', 'success');
      } else {
        const customerCode = nextCode || 'SRS-00000000';
        await createLead.mutateAsync({
          leadData: { ...form as any, customerCode, siteVisitDate: null, createdBy: userProfile.uid },
          userId: userProfile.uid, userName: userProfile.displayName,
        });
        toast('Lead created successfully', 'success');
      }
      navigate('/leads');
    } catch (err: any) {
      toast(err.message || 'Failed to save lead', 'error');
    }
  }

  if (leadLoading) return <div className="space-y-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 skeleton" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/leads" className="btn btn-ghost btn-sm p-2"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-text">{isEdit ? 'Edit Lead' : 'New Lead'}</h1>
          <p className="text-sm text-text-secondary">{isEdit ? 'Update lead information' : 'Create a new lead entry'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Client Name" required><input type="text" value={form.clientName} onChange={(e) => updateField('clientName', e.target.value)} className="input-field" required /></Field>
          <Field label="Contact Details" required><input type="text" value={form.contactDetails} onChange={(e) => updateField('contactDetails', e.target.value)} className="input-field" required /></Field>
          <Field label="Status"><select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="input-field">{LEAD_STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></Field>
          <Field label="Location"><input type="text" value={form.location} onChange={(e) => updateField('location', e.target.value)} className="input-field" placeholder="e.g. Kota Kinabalu" /></Field>
          <Field label="GPS Pin"><input type="text" value={form.gpsPin} onChange={(e) => updateField('gpsPin', e.target.value)} className="input-field" placeholder="lat,long" /></Field>
          <Field label="Property Type"><select value={form.propertyType} onChange={(e) => updateField('propertyType', e.target.value)} className="input-field"><option value="">Select...</option>{PROPERTY_TYPE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></Field>
          <Field label="Phase"><select value={form.phase} onChange={(e) => updateField('phase', e.target.value)} className="input-field"><option value="">Select...</option>{PHASE_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}</select></Field>
          <Field label="Avg Monthly Bill (RM)"><input type="text" value={form.avgMonthlyBill} onChange={(e) => updateField('avgMonthlyBill', e.target.value)} className="input-field" placeholder="e.g. 300-500" /></Field>
          <Field label="Preferred System"><select value={form.preferredSystem} onChange={(e) => updateField('preferredSystem', e.target.value)} className="input-field"><option value="">Select...</option>{PREFERRED_SYSTEM_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}</select></Field>
          <Field label="Sales Executive"><input type="text" value={form.salesExecutive} onChange={(e) => updateField('salesExecutive', e.target.value)} className="input-field" /></Field>
          <Field label="Site Visit Done By"><input type="text" value={form.siteVisitDoneBy} onChange={(e) => updateField('siteVisitDoneBy', e.target.value)} className="input-field" /></Field>
          <Field label="Proposal Prepared By"><input type="text" value={form.proposalPreparedBy} onChange={(e) => updateField('proposalPreparedBy', e.target.value)} className="input-field" /></Field>
          <Field label="Proposed Capacity (kWp)"><input type="text" value={form.proposedCapacity} onChange={(e) => updateField('proposedCapacity', e.target.value)} className="input-field" /></Field>
          <Field label="Project Value (RM)"><input type="text" value={form.projectValue} onChange={(e) => updateField('projectValue', e.target.value)} className="input-field" /></Field>
          <Field label="Customer Folder"><input type="text" value={form.customerFolder} onChange={(e) => updateField('customerFolder', e.target.value)} className="input-field" /></Field>
          <div className="md:col-span-2 lg:col-span-3">
            <Field label="Remarks"><textarea value={form.remarks} onChange={(e) => updateField('remarks', e.target.value)} rows={3} className="input-field resize-none" /></Field>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-5">
          <Link to="/leads" className="btn btn-secondary btn-md">Cancel</Link>
          <button type="submit" disabled={createLead.isPending || updateLead.isPending} className="btn btn-primary btn-md">
            <Save className="h-4 w-4" />
            {createLead.isPending || updateLead.isPending ? 'Saving...' : isEdit ? 'Update Lead' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-secondary">{label} {required && <span className="text-danger">*</span>}</label>
      {children}
    </div>
  );
}
