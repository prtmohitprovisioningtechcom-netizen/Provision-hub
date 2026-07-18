import { apiSuccess } from '@/server/utils/api-response';
import { AUTH_COOKIE } from '@/lib/auth-cookie';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const response = apiSuccess({ message: 'Logged out' });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
