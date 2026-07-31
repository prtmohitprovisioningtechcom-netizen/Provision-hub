import { LayoutClassic } from './LayoutClassic';
import { LayoutSplit } from './LayoutSplit';
import { LayoutBands } from './LayoutBands';
import type { LayoutId } from '@/lib/layout-id';
import type { ThemeLayoutProps } from './types';
import type { ComponentType } from 'react';

export { LayoutClassic, LayoutSplit, LayoutBands };
export type { ThemeLayoutProps };

export const LAYOUT_MAP: Record<LayoutId, ComponentType<ThemeLayoutProps>> = {
  '1': LayoutClassic,
  '2': LayoutSplit,
  '3': LayoutBands,
};
