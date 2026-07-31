'use client';

import { useEffect } from 'react';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import {
  initializePlatformBranding,
  type PlatformBranding,
} from '@/hooks/usePlatformBranding';

export function Providers({
  children,
  initialBranding,
}: {
  children: React.ReactNode;
  initialBranding: PlatformBranding;
}) {
  initializePlatformBranding(initialBranding);

  useEffect(() => {
    // Leftover SWs can serve stale Turbopack chunks ("module factory is not available").
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      });
    }
    if (process.env.NODE_ENV === 'development' && 'caches' in window) {
      void caches.keys().then((keys) => {
        keys.forEach((key) => void caches.delete(key));
      });
    }
  }, []);

  return (
    <ReduxProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
