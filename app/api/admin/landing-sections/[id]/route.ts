import { NextRequest, NextResponse } from 'next/server';
import Category from '@/models/Category';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/server/middleware/auth';

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    const body = await request.json();
    const update = {
      name: typeof body.name === 'string' ? body.name.trim() : undefined,
      slug:
        typeof body.slug === 'string' && body.slug.trim()
          ? createSlug(body.slug)
          : typeof body.name === 'string'
            ? createSlug(body.name)
            : undefined,
      description:
        typeof body.description === 'string' ? body.description.trim() : '',
      icon: typeof body.icon === 'string' ? body.icon.trim() : '',
      isActive: body.isActive !== false,
    };

    await connectDB();
    const section = await Category.findOneAndUpdate(
      { _id: id, type: 'landing_section' },
      update,
      { new: true, runValidators: true },
    ).lean();
    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Landing section not found' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: section });
  } catch (error: unknown) {
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Landing section name or slug already exists' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update landing section' },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    await connectDB();
    const section = await Category.findOneAndDelete({
      _id: id,
      type: 'landing_section',
    }).lean();
    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Landing section not found' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: {} });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete landing section' },
      { status: 400 },
    );
  }
}
