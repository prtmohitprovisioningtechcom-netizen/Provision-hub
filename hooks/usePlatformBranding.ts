'use client';

import { useEffect, useState } from 'react';

export interface PlatformBranding {
  logoText?: string;
  logoImage?: string;
}

const BRAND_EVENT = 'platform-branding-updated';
let cachedBranding: PlatformBranding | null = null;
let brandingRequest: Promise<PlatformBranding> | null = null;

function normalizeBranding(branding?: PlatformBranding): PlatformBranding {
  if (!branding) return { logoText: 'Bhartiyebazar' };
  const raw = branding.logoText?.trim() || '';
  const cleaned = raw.replace(
    /Multi-Tenant(?:\s+Platform)?(?:\s+Provisioning\s+Tech)?|multitenant|multi-tenant|TenantHub|ProvisioningTechHub|Provisioning\s+Tech/gi,
    'Bhartiyebazar',
  );
  return {
    ...branding,
    logoText: cleaned || 'Bhartiyebazar',
  };
}

export function initializePlatformBranding(branding: PlatformBranding) {
  cachedBranding = normalizeBranding(branding);
}

async function loadBranding(): Promise<PlatformBranding> {
  if (cachedBranding) return cachedBranding;

  brandingRequest ??= fetch('/api/admin/settings')
    .then((response) => response.json())
    .then((response) => normalizeBranding(response?.data?.themeConfig || {}))
    .catch(() => ({ logoText: 'Bhartiyebazar' }))
    .finally(() => {
      brandingRequest = null;
    });

  cachedBranding = await brandingRequest;
  return cachedBranding;
}

export function setPlatformBranding(branding: PlatformBranding) {
  const normalized = normalizeBranding(branding);
  cachedBranding = normalized;
  window.dispatchEvent(new CustomEvent(BRAND_EVENT, { detail: normalized }));
}

export function usePlatformBranding(initialBranding?: PlatformBranding) {
  const [branding, setBranding] = useState<PlatformBranding>(
    normalizeBranding(initialBranding || cachedBranding || {}),
  );

  useEffect(() => {
    if (initialBranding) {
      const normalized = normalizeBranding(initialBranding);
      cachedBranding = normalized;
      requestAnimationFrame(() => setBranding(normalized));
    } else {
      loadBranding().then(setBranding);
    }

    const handleUpdate = (event: Event) => {
      setBranding(normalizeBranding((event as CustomEvent<PlatformBranding>).detail));
    };

    window.addEventListener(BRAND_EVENT, handleUpdate);
    return () => window.removeEventListener(BRAND_EVENT, handleUpdate);
  }, [initialBranding]);

  return branding;
}
