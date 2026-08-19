import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, Role } from '../types/hutRi';
import api, { tokenStore } from '../services/api';

interface AuthContextValue {
  user: AuthUser | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  hasRole: (required: Role) => boolean;
}

export const ROLE_RANK: Role[] = ['VIEWER', 'OPERATOR', 'ADMIN', 'SUPERADMIN'];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider(props: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let active = true;
    const token = tokenStore.get();
    if (!token) {
      setIsInitializing(false);
      return;
    }
    (async () => {
      try {
        const result = await api.getCurrentUser(token);
        if (active) {
          if (result.success && result.data) {
            setUser(result.data);
          } else {
            tokenStore.clear();
          }
        }
      } catch {
        if (active) tokenStore.clear();
      } finally {
        if (active) setIsInitializing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    if (result.success && result.data) {
      tokenStore.set(result.data.token);
      setUser(result.data.user);
    }
    return { success: result.success, message: result.message };
  }, []);

  const logout = useCallback(async () => {
    const token = tokenStore.get();
    if (token) {
      try {
        await api.logout(token);
      } catch {
        /* ignore */
      }
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (required: Role) => {
      if (!user) return false;
      const userRank = ROLE_RANK.indexOf(user.role);
      const requiredRank = ROLE_RANK.indexOf(required);
      return userRank >= 0 && requiredRank >= 0 && userRank >= requiredRank;
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, isInitializing, login, logout, hasRole }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}