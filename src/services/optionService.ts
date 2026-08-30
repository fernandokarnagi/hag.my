import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface OptionItem {
  id: string;
  value: string;
  label: string;
  order: number;
  active: boolean;
}

export type LeadStatusItem = OptionItem;
export type PropertyTypeItem = OptionItem;

export interface Employee {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

// Generic option CRUD
function createOptionService(collectionName: string) {
  const ref = collection(db, collectionName);

  return {
    async getAll(): Promise<OptionItem[]> {
      const q = query(ref, orderBy('order', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as OptionItem));
    },
    async add(data: Omit<OptionItem, 'id'>) {
      await addDoc(ref, data);
    },
    async update(id: string, data: Partial<OptionItem>) {
      await updateDoc(doc(db, collectionName, id), data);
    },
    async remove(id: string) {
      await deleteDoc(doc(db, collectionName, id));
    },
  };
}

// Employee CRUD
const EMPLOYEES_REF = collection(db, 'employees');

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    const q = query(EMPLOYEES_REF, orderBy('name', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Employee));
  },
  async add(data: Omit<Employee, 'id'>) {
    await addDoc(EMPLOYEES_REF, data);
  },
  async update(id: string, data: Partial<Employee>) {
    await updateDoc(doc(db, 'employees', id), data);
  },
  async remove(id: string) {
    await deleteDoc(doc(db, 'employees', id));
  },
};

export const leadStatusService = createOptionService('leadStatuses');
export const propertyTypeService = createOptionService('propertyTypes');
export const phaseService = createOptionService('phases');
export const preferredSystemService = createOptionService('preferredSystems');

// Export individual functions for backward compatibility
export const getLeadStatuses = leadStatusService.getAll;
export const addLeadStatus = leadStatusService.add;
export const updateLeadStatus = leadStatusService.update;
export const deleteLeadStatus = leadStatusService.remove;

export const getPropertyTypes = propertyTypeService.getAll;
export const addPropertyType = propertyTypeService.add;
export const updatePropertyType = propertyTypeService.update;
export const deletePropertyType = propertyTypeService.remove;
