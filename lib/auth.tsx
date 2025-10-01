import { api } from '@/lib/api';
import { setAuthToken } from '@/lib/http';
import { User } from '@/types/models';
import React from 'react';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<User>;
  quickPick: (userId: string) => Promise<User>;
  register: (input: { email: string; name: string; roleName: User['role']; department?: string }) => Promise<User>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(false);

  const login = async (email: string) => {
    setLoading(true);
    try {
      const u = await api.loginWithEmail(email);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const quickPick = async (userId: string) => {
    setLoading(true);
    try {
      const u = await api.quickPick(userId);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const register = async (input: { email: string; name: string; roleName: User['role']; department?: string }) => {
    setLoading(true);
    try {
      const u = await api.register(input as any);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextValue = { user, loading, login, quickPick, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
