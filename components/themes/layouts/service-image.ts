/** Resolve a display image for a service from builder cards or catalog rows. */
export function getServiceImage(service: unknown): string {
  if (!service || typeof service !== 'object') return '';
  const row = service as Record<string, unknown>;

  const direct = typeof row.image === 'string' ? row.image.trim() : '';
  if (direct) return direct;

  if (Array.isArray(row.images)) {
    const first = row.images.find((v) => typeof v === 'string' && v.trim());
    if (first) return String(first).trim();
  }

  if (Array.isArray(row.gallery)) {
    const first = row.gallery.find((v) => typeof v === 'string' && v.trim());
    if (first) return String(first).trim();
  }

  return '';
}
