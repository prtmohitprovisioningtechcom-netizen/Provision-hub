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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) {
      dispatch(setTheme(saved));
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      dispatch(setTheme('dark'));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('theme', mode);
  }, [mode, mounted]);

  const toggle = useCallback(() => dispatch(toggleTheme()), [dispatch]);
  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);

  if (!mounted) return <>{children}</>;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
