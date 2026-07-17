'use client';

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
