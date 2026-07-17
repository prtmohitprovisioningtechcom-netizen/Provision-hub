import { ReactNode } from 'react';
import { BrandLogo } from '@/components/BrandLogo';

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <BrandLogo className="mx-auto mb-6" imageClassName="h-12" iconClassName="h-12 w-12" />
      {children}
    </div>
  );
}
