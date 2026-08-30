import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
