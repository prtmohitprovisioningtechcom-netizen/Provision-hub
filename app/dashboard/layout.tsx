'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  Package,
  Wrench,
  Image,
  FileText,
  Users,
  MessageSquare,
  Mail,
  Star,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Clock,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/BrandLogo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import { getInitials } from '@/lib/utils';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/website', label: 'Website Builder', icon: Globe },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/blogs', label: 'Blogs', icon: FileText },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/subscribers', label: 'Subscribers', icon: Mail },
  { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { companySlug } = useCompany();

  useEffect(() => {
    // If the user is a company owner and not already on the select-theme page, check if they have a theme
    if (user?.role === 'company_admin' && pathname !== '/dashboard/select-theme') {
      api.get('/api/dashboard/landing-page')
        .then(res => {
          if (res.data?.success) {
             const landingPage = res.data.data;
             if (!landingPage?.templateId) {
               router.push('/dashboard/select-theme');
             }
          }
        })
        .catch(err => {
          // Ignore 404s as it might just mean they haven't created one yet
          if (err.response?.status === 404) {
            router.push('/dashboard/select-theme');
          } else {
            console.error('Failed to check theme configuration:', err);
          }
        });
    }
  }, [user, pathname, router]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logout();
    window.location.href = '/login';
  };

  const companyRef = typeof user?.companyId === 'object' ? (user.companyId as any) : null;
  const companyStatus = companyRef?.status || 'pending';

  if (!isLoading && user?.role === 'company_admin' && companyStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Account Pending Verification
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Your account is currently under review by our administration team. You will gain full access to the dashboard once your profile is verified.
          </p>
          <Button onClick={handleLogout} className="w-full h-11" variant="outline" disabled={isLoggingOut}>
            {isLoggingOut ? 'Signing out...' : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <BrandLogo
            href="/dashboard"
            imageClassName="h-8"
            iconClassName="h-8 w-8"
            textClassName="text-lg"
          />
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarFallback>{getInitials(user?.name || 'U')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-xl px-4 dark:border-gray-800 dark:bg-gray-900/80">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to site
          </Link>
          <div className="flex-1" />
          {companySlug && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/${companySlug}`} target="_blank">
                <Globe className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">View Live Page</span>
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 lg:hidden dark:hover:bg-red-950/50"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </Button>
        </header>
        <main className="min-h-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
