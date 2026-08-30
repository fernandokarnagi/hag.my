import { Timestamp } from 'firebase/firestore';

export type LeadStatus =
  | 'GOOGLE_FORM-INCOMING'
  | 'NO_RESPONSE'
  | 'SITE_VISIT'
  | 'PROPOSAL_QUOTATION'
  | 'BOOKING_FEE_RECEIVED'
  | 'SESB_SUBMITTED'
  | 'SESB_APPROVED'
  | 'PROFORMA_SENT'
  | '50_COLLECTED'
  | 'ECOS_DOCS_COLLECTED'
  | 'PASSED_TO_ISYRAQ'
  | 'ECOS_SUBMITTED'
  | 'ECOS_APPROVED'
  | 'INVOICE_SENT_40'
  | '40_COLLECTED'
  | 'INSTALLATION_DONE'
  | 'INVOICE_SENT_10'
  | '10_COLLECTED'
  | 'TC'
  | 'SRATO'
  | 'TURN_ON';

export type PropertyType =
  | 'Terrace'
  | 'Bungalow'
  | 'Semi D'
  | 'Detached House'
  | 'Landed House';

export type UserRole = 'admin' | 'sales' | 'cs' | 'engineer';

export type PipelineStageStatus = 'DONE' | 'PENDING' | 'AFTER ECOS';

export const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'GOOGLE_FORM-INCOMING', label: 'Google Form Incoming' },
  { value: 'NO_RESPONSE', label: 'No Response' },
  { value: 'SITE_VISIT', label: 'Site Visit' },
  { value: 'PROPOSAL_QUOTATION', label: 'Proposal & Quotation' },
  { value: 'BOOKING_FEE_RECEIVED', label: 'Booking Fee Received' },
  { value: 'SESB_SUBMITTED', label: 'SESB Submitted' },
  { value: 'SESB_APPROVED', label: 'SESB Approved' },
  { value: 'PROFORMA_SENT', label: 'Proforma Sent' },
  { value: '50_COLLECTED', label: '50% Collected' },
  { value: 'ECOS_DOCS_COLLECTED', label: 'ECOS Docs Collected' },
  { value: 'PASSED_TO_ISYRAQ', label: 'Passed to Isyraq' },
  { value: 'ECOS_SUBMITTED', label: 'ECOS Submitted' },
  { value: 'ECOS_APPROVED', label: 'ECOS Approved' },
  { value: 'INVOICE_SENT_40', label: 'Invoice Sent (40%)' },
  { value: '40_COLLECTED', label: '40% Collected' },
  { value: 'INSTALLATION_DONE', label: 'Installation Done' },
  { value: 'INVOICE_SENT_10', label: 'Invoice Sent (10%)' },
  { value: '10_COLLECTED', label: '10% Collected' },
  { value: 'TC', label: 'T&C' },
  { value: 'SRATO', label: 'SRATO' },
  { value: 'TURN_ON', label: 'Turn On' },
];

export const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: 'Terrace', label: 'Terrace' },
  { value: 'Bungalow', label: 'Bungalow' },
  { value: 'Semi D', label: 'Semi D' },
  { value: 'Detached House', label: 'Detached House' },
  { value: 'Landed House', label: 'Landed House' },
];

export const PHASE_OPTIONS = ['Single Phase', '3 Phase'] as const;

export const PREFERRED_SYSTEM_OPTIONS = [
  'Solar only',
  'Solar + battery',
  'Request both',
  'Does not mention',
] as const;

export const PIPELINE_STAGES: LeadStatus[] = [
  'GOOGLE_FORM-INCOMING',
  'NO_RESPONSE',
  'SITE_VISIT',
  'PROPOSAL_QUOTATION',
  'BOOKING_FEE_RECEIVED',
  'SESB_SUBMITTED',
  'SESB_APPROVED',
  'PROFORMA_SENT',
  '50_COLLECTED',
  'ECOS_DOCS_COLLECTED',
  'PASSED_TO_ISYRAQ',
  'ECOS_SUBMITTED',
  'ECOS_APPROVED',
  'INVOICE_SENT_40',
  '40_COLLECTED',
  'INSTALLATION_DONE',
  'INVOICE_SENT_10',
  '10_COLLECTED',
  'TC',
  'SRATO',
  'TURN_ON',
];

export interface Lead {
  id: string;
  customerCode: string;
  clientName: string;
  status: LeadStatus;
  contactDetails: string;
  siteVisitDate: Timestamp | null;
  siteVisitDoneBy: string;
  salesExecutive: string;
  proposalPreparedBy: string;
  phase: string;
  avgMonthlyBill: string;
  preferredSystem: string;
  propertyType: PropertyType | null;
  proposedCapacity: string;
  projectValue: string;
  location: string;
  gpsPin: string;
  customerFolder: string;
  remarks: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface StatusUpdate {
  id: string;
  leadId: string;
  customerCode: string;
  stage: LeadStatus;
  status: PipelineStageStatus;
  updatedBy: string;
  updatedAt: Timestamp;
  notes: string;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Timestamp;
}
