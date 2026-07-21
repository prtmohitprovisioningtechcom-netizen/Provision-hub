import { saveMediaFromDataUrl, deleteMediaById } from '@/lib/media-storage';

/**
 * Image uploads are stored in MongoDB and served from /api/media/[id].
 * No Cloudinary account is required.
 */
export async function uploadToCloudinary(
  file: string,
  folder = 'multi-tenant',
): Promise<{ url: string; publicId: string }> {
  // folder kept for API compatibility; companyId is extracted by callers when needed.
  // When folder looks like `gallery/{companyId}`, use that id.
  const companyId = folder.includes('/') ? folder.split('/').pop()! : folder;
  return saveMediaFromDataUrl(companyId, file);
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  mimeType: string,
  folder = 'multi-tenant',
): Promise<{ url: string; publicId: string }> {
  const { saveMediaBuffer } = await import('@/lib/media-storage');
  const companyId = folder.includes('/') ? folder.split('/').pop()! : folder;
  return saveMediaBuffer({ companyId, buffer, mimeType });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // Skip legacy Cloudinary public IDs that are not Mongo ObjectIds.
  if (!/^[a-f\d]{24}$/i.test(publicId)) return;
  await deleteMediaById(publicId);
}
