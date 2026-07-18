const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
const MAX_OUTPUT_BYTES = 1.8 * 1024 * 1024;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Could not compress image'));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

/** Compress an image file in the browser so uploads stay under Vercel body limits. */
export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file');
  }

  // GIFs can lose animation; keep small GIFs as-is.
  if (file.type === 'image/gif' && file.size <= MAX_OUTPUT_BYTES) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not compress image');
    ctx.drawImage(img, 0, 0, width, height);

    const outputType =
      file.type === 'image/png' || file.type === 'image/webp'
        ? file.type
        : 'image/jpeg';

    let quality = JPEG_QUALITY;
    let blob = await canvasToBlob(canvas, outputType, quality);

    while (blob.size > MAX_OUTPUT_BYTES && quality > 0.45) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    }

    if (blob.size > MAX_OUTPUT_BYTES) {
      throw new Error('Image is still too large after compression. Try a smaller file.');
    }

    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${baseName}.${ext}`, { type: blob.type });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function compressDataUrl(dataUrl: string, name = 'image.jpg'): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
  return compressImageFile(file);
}
