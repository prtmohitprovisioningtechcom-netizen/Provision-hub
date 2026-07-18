import { NextRequest, NextResponse } from 'next/server';
import Requirement from '@/models/Requirement';
import { connectDB } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Basic validation
    if (!body.customerName || !body.email || !body.phone || !body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const requirement = await Requirement.create(body);
    return NextResponse.json({ success: true, data: requirement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
