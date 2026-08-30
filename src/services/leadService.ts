import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Lead, LeadStatus } from '@/types';

const LEADS_REF = collection(db, 'leads');

export async function createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = Timestamp.now();
  const docRef = await addDoc(LEADS_REF, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateLead(id: string, data: Partial<Lead>) {
  const ref = doc(db, 'leads', id);
  await updateDoc(ref, { ...data, updatedAt: Timestamp.now() });
}

export async function deleteLead(id: string) {
  await deleteDoc(doc(db, 'leads', id));
}

export async function getLead(id: string): Promise<Lead | null> {
  const snap = await getDoc(doc(db, 'leads', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Lead) : null;
}

export async function getLeads(filters?: {
  status?: LeadStatus;
  salesExecutive?: string;
  location?: string;
  propertyType?: string;
  search?: string;
  limit?: number;
}): Promise<Lead[]> {
  let q = query(LEADS_REF, orderBy('createdAt', 'desc'));

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters?.salesExecutive) {
    q = query(q, where('salesExecutive', '==', filters.salesExecutive));
  }
  if (filters?.location) {
    q = query(q, where('location', '==', filters.location));
  }
  if (filters?.propertyType) {
    q = query(q, where('propertyType', '==', filters.propertyType));
  }
  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snap = await getDocs(q);
  let leads = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lead));

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    leads = leads.filter(
      (l) =>
        l.clientName.toLowerCase().includes(s) ||
        l.customerCode.toLowerCase().includes(s) ||
        l.contactDetails.includes(s) ||
        l.location.toLowerCase().includes(s)
    );
  }

  return leads;
}

export async function getNextCustomerCode(): Promise<string> {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `SRS-${yy}${mm}`;

  const q = query(LEADS_REF, where('customerCode', '>=', prefix), where('customerCode', '<', `${prefix}z`), orderBy('customerCode', 'desc'), limit(1));
  const snap = await getDocs(q);

  if (snap.empty) {
    return `${prefix}0001`;
  }

  const lastCode = snap.docs[0].data().customerCode;
  const lastNum = parseInt(lastCode.slice(-4), 10);
  const nextNum = (lastNum + 1).toString().padStart(4, '0');
  return `${prefix}${nextNum}`;
}
