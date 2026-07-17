'use client';

import { useEffect, useState } from 'react';

export interface PlatformBranding {
  logoText?: string;
  logoImage?: string;
}

const BRAND_EVENT = 'platform-branding-updated';
let cachedBranding: PlatformBranding | null = null;
let brandingRequest: Promise<PlatformBranding> | null = null;

async function loadBranding(): Promise<PlatformBranding> {
  if (cachedBranding) return cachedBranding;

  brandingRequest ??= fetch('/api/admin/settings')
    .then((response) => response.json())
    .then((response) => response?.data?.themeConfig || {})
    .catch(() => ({}))
    .finally(() => {
      brandingRequest = null;
    });

  cachedBranding = await brandingRequest;
  return cachedBranding;
}

export function setPlatformBranding(branding: PlatformBranding) {
  cachedBranding = branding;
  window.dispatchEvent(new CustomEvent(BRAND_EVENT, { detail: branding }));
}

export function usePlatformBranding(initialBranding?: PlatformBranding) {
  const [branding, setBranding] = useState<PlatformBranding>(
    initialBranding || cachedBranding || {},
  );

  useEffect(() => {
    if (initialBranding) {
      cachedBranding = initialBranding;
      setBranding(initialBranding);
    } else {
      loadBranding().then(setBranding);
    }

    const handleUpdate = (event: Event) => {
      setBranding((event as CustomEvent<PlatformBranding>).detail);
    };

    window.addEventListener(BRAND_EVENT, handleUpdate);
    return () => window.removeEventListener(BRAND_EVENT, handleUpdate);
  }, [initialBranding]);

  return branding;
}
