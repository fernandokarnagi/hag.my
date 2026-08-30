import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, UserRole } from '@/types';

export async function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerUser(email: string, password: string, displayName: string, role: UserRole = 'cs') {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    displayName,
    email,
    role,
    active: true,
    createdAt: new Date(),
  });
  return credential;
}

export async function logoutUser() {
  return signOut(auth);
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
