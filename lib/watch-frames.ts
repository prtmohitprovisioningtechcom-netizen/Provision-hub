export const FRAME_COUNT = 111;
export const FIRST_FRAME_SRC = frameSrc(0);

export function frameSrc(index: number) {
  const n = Math.max(0, Math.min(index, FRAME_COUNT - 1));
  return `/bharti-opt/f${String(n).padStart(3, '0')}.jpg`;
}
