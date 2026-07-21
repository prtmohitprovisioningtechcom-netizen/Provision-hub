import { connectDB } from '@/lib/mongodb';
import Media from '@/models/Media';

const MAX_STORE_BYTES = 1.8 * 1024 * 1024;

export async function saveMediaBuffer(options: {
  companyId: string;
  buffer: Buffer;
  mimeType: string;
  filename?: string;
}): Promise<{ id: string; url: string; publicId: string }> {
  const { companyId, buffer, mimeType, filename } = options;

  if (buffer.length > MAX_STORE_BYTES) {
    throw new Error('Image is too large after compression. Try a smaller file.');
  }

  await connectDB();
  const media = await Media.create({
    companyId,
    mimeType,
    filename,
    size: buffer.length,
    data: buffer,
  });

  const id = String(media._id);
  return {
    id,
    url: `/api/media/${id}`,
    publicId: id,
  };
}

export async function deleteMediaById(mediaId: string): Promise<void> {
  if (!mediaId) return;
  await connectDB();
  await Media.findByIdAndDelete(mediaId);
}

/** Accept data URL or raw base64 and store in MongoDB. */
export async function saveMediaFromDataUrl(
  companyId: string,
  imageData: string,
  filename?: string,
): Promise<{ url: string; publicId: string }> {
  let mimeType = 'image/jpeg';
  let base64 = imageData;

  if (imageData.startsWith('data:')) {
    const match = imageData.match(/^data:([^;]+);base64,(.+)$/i);
    if (!match) throw new Error('Invalid image data');
    mimeType = match[1];
    base64 = match[2];
  }

  const buffer = Buffer.from(base64, 'base64');
  return saveMediaBuffer({ companyId, buffer, mimeType, filename });
}
