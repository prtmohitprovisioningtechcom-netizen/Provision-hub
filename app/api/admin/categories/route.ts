import { NextRequest, NextResponse } from 'next/server';
import Category from '@/models/Category';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();
    const body = await request.json();
    
    // Create a slug from the name if not provided
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const category = await Category.create(body);
    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Category with this name or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
