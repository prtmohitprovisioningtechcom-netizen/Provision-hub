export const LAYOUT_IDS = ['1', '2', '3'] as const;
export type LayoutId = (typeof LAYOUT_IDS)[number];

export const LAYOUT_OPTIONS = [
  {
    id: '1' as const,
    name: 'Layout 1 — Signature',
    description: 'Theme ka original unique design — best look for that style.',
  },
  {
    id: '2' as const,
    name: 'Layout 2 — Split',
    description: 'Same theme colors, split hero + zig-zag services.',
  },
  {
    id: '3' as const,
    name: 'Layout 3 — Classic Business',
    description: 'Same as Modern Business — sliding hero images, premium company landing.',
  },
] as const;

export function normalizeLayoutId(value: unknown): LayoutId {
  const raw = String(value || '1').trim();
  if (raw === '2' || raw === '3') return raw;
  return '1';
}
