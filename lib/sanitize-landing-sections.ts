const MAX_PAYLOAD_CHARS = 3_200_000; // stay under Vercel ~4.5MB with JSON overhead

function stripDataUrls(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value.startsWith('data:image/')) return '';
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(stripDataUrls);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[key] = stripDataUrls(nested);
    }
    return out;
  }
  return value;
}

export function containsDataImage(value: unknown): boolean {
  if (typeof value === 'string') return value.startsWith('data:image/');
  if (Array.isArray(value)) return value.some(containsDataImage);
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some(containsDataImage);
  }
  return false;
}

/** Remove embedded base64 images so publish payloads stay small. */
export function sanitizeLandingSections<T>(sections: T[]): {
  sections: T[];
  hadEmbeddedImages: boolean;
  tooLarge: boolean;
} {
  const hadEmbeddedImages = containsDataImage(sections);
  const cleaned = stripDataUrls(sections) as T[];
  const tooLarge = JSON.stringify(cleaned).length > MAX_PAYLOAD_CHARS;
  return { sections: cleaned, hadEmbeddedImages, tooLarge };
}
