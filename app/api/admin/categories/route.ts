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

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;
    await connectDB();
    const categories = await Category.find({
      $or: [{ type: 'business' }, { type: { $exists: false } }]
    }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['super_admin']);
    if (auth instanceof Response) return auth;
    await connectDB();
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 },
      );
    }

    const slug =
      typeof body.slug === 'string' && body.slug.trim()
        ? createSlug(body.slug)
        : createSlug(name);

    const existing = await Category.findOne({
      type: 'business',
      $or: [{ name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }, { slug }],
    }).lean();

    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        alreadyExists: true,
        message: 'Category already exists',
      });
    }

    const category = await Category.create({
      name,
      slug,
      description: typeof body.description === 'string' ? body.description.trim() : '',
      icon: typeof body.icon === 'string' ? body.icon.trim() : '',
      isActive: body.isActive !== false,
      type: 'business',
    });
    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'This name or slug is used by another category. Please choose a different value.',
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
