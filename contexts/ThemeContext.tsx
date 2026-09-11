'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { setTheme, toggleTheme } from '@/store/slices/themeSlice';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) {
      dispatch(setTheme(saved));
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      dispatch(setTheme('dark'));
      document.documentElement.classList.toggle('dark', true);
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    try {
      localStorage.setItem('theme', mode);
    } catch (e) {}
  }, [mode]);

  const toggle = useCallback(() => {
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(nextMode));
    document.documentElement.classList.toggle('dark', nextMode === 'dark');
    try {
      localStorage.setItem('theme', nextMode);
    } catch (e) {}
  }, [mode, dispatch]);

  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
