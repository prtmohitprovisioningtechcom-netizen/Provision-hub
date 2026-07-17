import { apiSuccess } from '@/server/utils/api-response';
import { AUTH_COOKIE, COOKIE_OPTIONS } from '@/lib/auth-cookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const response = apiSuccess({ message: 'Logged out' });
  response.cookies.set(AUTH_COOKIE, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
