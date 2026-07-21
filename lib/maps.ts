/**
 * Convert a Google Maps share link, embed URL, or plain address into an iframe src.
 */
export function toGoogleMapsEmbedUrl(input?: string | null): string | null {
  const value = input?.trim();
  if (!value) return null;

  if (value.includes('google.com/maps/embed')) {
    return value;
  }

  // Extract coords from @lat,lng patterns
  const atMatch = value.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return `https://www.google.com/maps?q=${atMatch[1]},${atMatch[2]}&z=15&output=embed`;
  }

  // Place / search / short links / free-text address
  return `https://www.google.com/maps?q=${encodeURIComponent(value)}&output=embed`;
}
