import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import { connectDB } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'business';

    await connectDB();
    const categories = await Category.find({ 
      isActive: true, 
      type: type as 'business' | 'landing_section' 
    }).sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
