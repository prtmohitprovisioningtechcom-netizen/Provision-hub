import { NextRequest, NextResponse } from 'next/server';
import { toNodeBuffer } from '@/lib/images';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return new NextResponse('Not found', { status: 404 });
    }

    const [mediaList] = await pool.execute<RowDataPacket[]>('SELECT data, mimeType FROM media WHERE id = ?', [id]);
    if (mediaList.length === 0 || !mediaList[0].data) {
      return new NextResponse('Not found', { status: 404 });
    }
    
    const media = mediaList[0];
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
