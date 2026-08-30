import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export type AuditAction = 'create' | 'update' | 'delete' | 'status_change';

export interface AuditLog {
  id: string;
  leadId: string;
  customerCode: string;
  action: AuditAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  timestamp: Timestamp;
  details?: string;
}

const AUDIT_REF = collection(db, 'auditLogs');

export async function logAuditEvent(data: Omit<AuditLog, 'id' | 'timestamp'>) {
  try {
    console.log('Creating audit log:', data);
    await addDoc(AUDIT_REF, {
      ...data,
      timestamp: Timestamp.now(),
    });
    console.log('Audit log created successfully');
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}

export async function logLeadCreated(leadId: string, customerCode: string, userId: string, userName: string) {
  await logAuditEvent({
    leadId,
    customerCode,
    action: 'create',
    userId,
    userName,
    details: 'Lead created',
  });
}

export async function logLeadUpdated(
  leadId: string,
  customerCode: string,
  userId: string,
  userName: string,
  changes: { field: string; oldValue: string; newValue: string }[]
) {
  for (const change of changes) {
    await logAuditEvent({
      leadId,
      customerCode,
      action: change.field === 'status' ? 'status_change' : 'update',
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      userId,
      userName,
    });
  }
}

export async function logLeadDeleted(leadId: string, customerCode: string, userId: string, userName: string) {
  await logAuditEvent({
    leadId,
    customerCode,
    action: 'delete',
    userId,
    userName,
    details: 'Lead deleted',
  });
}

export async function getAuditLogs(leadId: string): Promise<AuditLog[]> {
  try {
    console.log('Fetching audit logs for leadId:', leadId);
    const q = query(AUDIT_REF, where('leadId', '==', leadId), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    console.log('Found audit logs:', snap.size);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

export async function getRecentAuditLogs(limit: number = 50): Promise<AuditLog[]> {
  const q = query(AUDIT_REF, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.slice(0, limit).map((d) => ({ id: d.id, ...d.data() } as AuditLog));
}
