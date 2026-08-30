import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface LeadStatusItem {
  id: string;
  value: string;
  label: string;
  order: number;
  active: boolean;
}

export interface PropertyTypeItem {
  id: string;
  value: string;
  label: string;
  order: number;
  active: boolean;
}

const LEAD_STATUSES_REF = collection(db, 'leadStatuses');
const PROPERTY_TYPES_REF = collection(db, 'propertyTypes');

// Lead Statuses
export async function getLeadStatuses(): Promise<LeadStatusItem[]> {
  const q = query(LEAD_STATUSES_REF, orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeadStatusItem));
}

export async function addLeadStatus(data: Omit<LeadStatusItem, 'id'>) {
  await addDoc(LEAD_STATUSES_REF, data);
}

export async function updateLeadStatus(id: string, data: Partial<LeadStatusItem>) {
  await updateDoc(doc(db, 'leadStatuses', id), data);
}

export async function deleteLeadStatus(id: string) {
  await deleteDoc(doc(db, 'leadStatuses', id));
}

// Property Types
export async function getPropertyTypes(): Promise<PropertyTypeItem[]> {
  const q = query(PROPERTY_TYPES_REF, orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PropertyTypeItem));
}

export async function addPropertyType(data: Omit<PropertyTypeItem, 'id'>) {
  await addDoc(PROPERTY_TYPES_REF, data);
}

export async function updatePropertyType(id: string, data: Partial<PropertyTypeItem>) {
  await updateDoc(doc(db, 'propertyTypes', id), data);
}

export async function deletePropertyType(id: string) {
  await deleteDoc(doc(db, 'propertyTypes', id));
}
