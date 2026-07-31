export function readField(item: Record<string, unknown>, key: string): string {
  const value = item[key];
  return value != null ? String(value) : '';
}

export function readNumber(item: Record<string, unknown>, key: string): number {
  const value = item[key];
  return typeof value === 'number' ? value : Number(value ?? 0);
}
