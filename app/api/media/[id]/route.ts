import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { toNodeBuffer } from '@/lib/images';
import Media from '@/models/Media';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Not found', { status: 404 });
    }

    await connectDB();
    // Avoid lean() so Buffer fields stay as Node Buffers (lean often returns BSON Binary).
    const media = await Media.findById(id).select('data mimeType');
    if (!media?.data) {
      return new NextResponse('Not found', { status: 404 });
    }

    const body = toNodeBuffer(media.data);

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        'Content-Type': media.mimeType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(body.length),
      },
    });
  } catch (error) {
    console.error('Media serve failed:', error);
    return new NextResponse('Failed to load image', { status: 500 });
  }
}
