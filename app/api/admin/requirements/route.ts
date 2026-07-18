import { NextRequest, NextResponse } from 'next/server';
import Requirement from '@/models/Requirement';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/server/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;
    
    await connectDB();
    const requirements = await Requirement.find().sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, data: requirements });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
