import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const regularAuthRoutes = [
  '/login',
  '/register/company',
  '/forgot-password',
  '/reset-password',
];
const adminAuthRoutes = ['/admin/login', '/admin/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;
  const user = token ? await verifyToken(token) : null;

  const isAdminAuthRoute = adminAuthRoutes.includes(pathname);
  const isRegularAuthRoute = regularAuthRoutes.includes(pathname);
  const isAdminPanel = pathname.startsWith('/admin') && !isAdminAuthRoute;
  const isDashboard = pathname.startsWith('/dashboard');

  if (isAdminAuthRoute && user?.role === 'super_admin') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (isRegularAuthRoute && user) {
    const redirect =
      user.role === 'super_admin'
        ? '/admin'
        : user.role === 'company_admin'
          ? '/dashboard'
          : '/search';
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  if (isAdminPanel && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isDashboard && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isDashboard && user && user.role !== 'company_admin') {
    return NextResponse.redirect(
      new URL(user.role === 'super_admin' ? '/admin' : '/search', request.url),
    );
  }

  if (isAdminPanel && user && user.role !== 'super_admin') {
    return NextResponse.redirect(
      new URL(user.role === 'company_admin' ? '/dashboard' : '/search', request.url),
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
