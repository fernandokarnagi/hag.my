import { collection, doc, getDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { User, UserRole } from '@/types';

const USERS_REF = collection(db, 'users');

export async function getUsers(): Promise<User[]> {
  const snap = await getDocs(USERS_REF);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as User));
}

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as User) : null;
}

export async function updateUserRole(uid: string, role: UserRole) {
  await updateDoc(doc(db, 'users', uid), { role });
}

export async function updateUserActive(uid: string, active: boolean) {
  await updateDoc(doc(db, 'users', uid), { active });
}

export async function getUsersByRole(role: UserRole): Promise<User[]> {
  const q = query(USERS_REF, where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as User));
}
