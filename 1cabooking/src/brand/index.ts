import { brand1ca } from './1ca';
import { brandHdx1ca } from './hdx1ca';
import type { BrandConfig } from './types';

const BRANDS: Record<string, BrandConfig> = {
  '1ca': brand1ca,
  'hdx1ca': brandHdx1ca,
};

const active = (import.meta.env.VITE_BRAND as string | undefined) ?? '1ca';
export const brand: BrandConfig = BRANDS[active] ?? brand1ca;

export type { BrandConfig, Region } from './types';
