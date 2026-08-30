import { useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, getUserProfile } from '@/services/authService';
import { db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from '@/types';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    userProfile: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        let profile = await getUserProfile(user.uid);

        if (!profile) {
          const newProfile: User = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: 'cs',
            active: true,
            createdAt: new Date() as any,
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          profile = newProfile;
        }

        setState({ firebaseUser: user, userProfile: profile, loading: false });
      } else {
        setState({ firebaseUser: null, userProfile: null, loading: false });
      }
    });
    return unsubscribe;
  }, []);

  return state;
}
