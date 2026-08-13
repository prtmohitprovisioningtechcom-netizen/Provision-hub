export const FRAME_START = 19;
export const FRAME_END = 240;
export const FRAME_COUNT = FRAME_END - FRAME_START + 1;
export const FIRST_FRAME_SRC = frameSrc(0);

export function frameSrc(index: number) {
  const n = FRAME_START + Math.max(0, Math.min(index, FRAME_COUNT - 1));
  return `/bharti/frame_${String(n).padStart(4, '0')}.png`;
}
