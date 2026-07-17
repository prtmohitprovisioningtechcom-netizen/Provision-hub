'use client';

import { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { setUser, clearUser, setLoading } from '@/store/slices/authSlice';
import { IUser } from '@/types';
import axios from 'axios';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      if (data.success) {
        dispatch(setUser({ user: data.data, token: '' }));
      } else {
        dispatch(clearUser());
      }
    } catch {
      dispatch(clearUser());
    }
  }, [dispatch]);

  useEffect(() => {
    refreshUser().finally(() => dispatch(setLoading(false)));
  }, [refreshUser, dispatch]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await axios.post('/api/auth', { action: 'login', email, password });
    if (data.success) {
      dispatch(setUser({ user: data.data.user, token: data.data.token }));
    } else {
      throw new Error(data.message);
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    await axios.delete('/api/auth');
    dispatch(clearUser());
  }, [dispatch]);

  const value = useMemo(
    () => ({ user, isAuthenticated, isLoading, login, logout, refreshUser }),
    [user, isAuthenticated, isLoading, login, logout, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
