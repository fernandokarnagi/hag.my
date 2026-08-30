import { useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, getUserProfile } from '@/services/authService';
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
        const profile = await getUserProfile(user.uid);
        setState({ firebaseUser: user, userProfile: profile, loading: false });
      } else {
        setState({ firebaseUser: null, userProfile: null, loading: false });
      }
    });
    return unsubscribe;
  }, []);

  return state;
}
