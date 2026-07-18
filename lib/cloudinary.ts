import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function assertCloudinaryConfigured() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
    );
  }
}

export async function uploadToCloudinary(
  file: string,
  folder = 'multi-tenant',
): Promise<{ url: string; publicId: string }> {
  assertCloudinaryConfigured();

  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  mimeType: string,
  folder = 'multi-tenant',
): Promise<{ url: string; publicId: string }> {
  assertCloudinaryConfigured();

  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;
  return uploadToCloudinary(dataUri, folder);
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return;
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
