import { NextRequest, NextResponse } from 'next/server';
import Requirement from '@/models/Requirement';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/server/middleware/auth';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;
    
    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const requirement = await Requirement.findByIdAndUpdate(id, body, { new: true });
    
    if (!requirement) {
      return NextResponse.json({ success: false, error: 'Requirement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: requirement });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;
    
    await connectDB();
    const { id } = await context.params;
    
    const requirement = await Requirement.findByIdAndDelete(id);
    
    if (!requirement) {
      return NextResponse.json({ success: false, error: 'Requirement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
