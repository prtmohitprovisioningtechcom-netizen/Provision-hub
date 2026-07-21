/** True for placeholder brand text that should never be a nav/footer page link. */
export function isPlaceholderBrandLabel(value?: string | null): boolean {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');
  return normalized === 'your company';
}

/** Remove mistaken "Your Company" page links from navbar/footer items. */
export function filterNavFooterItems<T extends { label?: string; link?: string }>(
  items: T[] | undefined | null,
): T[] {
  if (!items?.length) return [];
  return items.filter((item) => {
    const label = String(item.label || '').trim();
    const link = String(item.link || '').trim().toLowerCase();
    if (!label && !link) return false;
    if (isPlaceholderBrandLabel(label)) return false;
    if (link.includes('/p/your-company')) return false;
    return true;
  });
}
