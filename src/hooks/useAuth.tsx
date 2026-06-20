import { createContext, useContext, useMemo, useState } from 'react';
import { login as loginRequest } from '../api/client';

interface AuthUser {
  email: string;
  name: string;
}

interface AuthState {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  session: AuthState | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = 'route-pilot-session';
const AuthContext = createContext<AuthContextValue | null>(null);

function readSession() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthState | null>(() => readSession());

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      login: async (email, password) => {
        const nextSession = await loginRequest(email, password);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
