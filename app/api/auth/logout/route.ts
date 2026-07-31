import { apiSuccess } from '@/server/utils/api-response';
import { AUTH_COOKIE } from '@/lib/auth-cookie';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  return apiSuccess({ message: 'Logged out' });
}
