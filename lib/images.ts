/** Local Mongo media + data URLs must skip Next.js image optimization. */
export function shouldSkipImageOptimization(src: string): boolean {
  return (
    src.startsWith('/api/media/') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  );
}

/** Normalize Mongo/BSON binary fields into a Node Buffer. */
export function toNodeBuffer(data: unknown): Buffer {
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof Uint8Array) return Buffer.from(data);
  if (data && typeof data === 'object') {
    const record = data as {
      buffer?: ArrayBuffer | Uint8Array | Buffer;
      type?: string;
      data?: number[];
    };
    if (Buffer.isBuffer(record.buffer)) return record.buffer;
    if (record.buffer instanceof Uint8Array) return Buffer.from(record.buffer);
    if (record.buffer instanceof ArrayBuffer) return Buffer.from(record.buffer);
    if (record.type === 'Buffer' && Array.isArray(record.data)) {
      return Buffer.from(record.data);
    }
  }
  throw new Error('Invalid media binary data');
}
