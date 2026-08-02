import { NextResponse } from 'next/server';
import { AdminService } from '@/server/services/admin.service';

/** Dev helper: ensure a super_admin exists (idempotent). */
export async function GET() {
  try {
    const admin = await AdminService.createSuperAdmin();
    return NextResponse.json({
      success: true,
      message: 'Super admin ready',
      email: admin.email || 'admin@tenanthub.com',
      passwordHint: 'Admin@123 (only if newly created)',
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
