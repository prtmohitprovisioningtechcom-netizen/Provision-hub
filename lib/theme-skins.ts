export type ThemeSkin = {
  id: string;
  primary: string;
  accent: string;
  /** Text/button label color on primary background */
  onPrimary: string;
  bg: string;
  surface: string;
  fg: string;
  muted: string;
  /** Footer / dark sections — always near-black or deep brand, never neon accent */
  inverseBg: string;
  inverseFg: string;
  border: string;
  displayFont: string;
  bodyFont: string;
  googleFontsUrl: string;
  radius: string;
  dark: boolean;
};

const SKINS: Record<string, ThemeSkin> = {
  default: {
    id: 'default',
    primary: '#4f46e5',
    accent: '#818cf8',
    onPrimary: '#ffffff',
    bg: '#f8fafc',
    surface: '#ffffff',
    fg: '#0f172a',
    muted: '#64748b',
    inverseBg: '#0f172a',
    inverseFg: '#f8fafc',
    border: 'rgba(15,23,42,0.1)',
    displayFont: "'Source Serif 4', Georgia, serif",
    bodyFont: "'Source Sans 3', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&display=swap',
    radius: '0.75rem',
    dark: false,
  },
  'creative-studio': {
    id: 'creative-studio',
    primary: '#ec4899',
    accent: '#f472b6',
    onPrimary: '#ffffff',
    bg: '#fafafa',
    surface: '#ffffff',
    fg: '#111827',
    muted: '#6b7280',
    inverseBg: '#111827',
    inverseFg: '#fafafa',
    border: 'rgba(17,24,39,0.08)',
    displayFont: "'Syne', system-ui, sans-serif",
    bodyFont: "'DM Sans', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Syne:wght@500;600;700;800&display=swap',
    radius: '1.25rem',
    dark: false,
  },
  'warm-showcase': {
    id: 'warm-showcase',
    primary: '#c4784a',
    accent: '#e8a87c',
    onPrimary: '#ffffff',
    bg: '#f7f3eb',
    surface: '#fffdf8',
    fg: '#1a2f23',
    muted: '#5c6b60',
    inverseBg: '#1a2f23',
    inverseFg: '#f7f3eb',
    border: 'rgba(26,47,35,0.12)',
    displayFont: "'Libre Baskerville', Georgia, serif",
    bodyFont: "'Karla', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap',
    radius: '0.35rem',
    dark: false,
  },
  'bold-launch': {
    id: 'bold-launch',
    primary: '#d4f542',
    accent: '#e8ff7a',
    onPrimary: '#050505',
    bg: '#050505',
    surface: '#111111',
    fg: '#f5f5f5',
    muted: '#a3a3a3',
    inverseBg: '#0a0a0a',
    inverseFg: '#f5f5f5',
    border: 'rgba(255,255,255,0.12)',
    displayFont: "'Bebas Neue', Impact, sans-serif",
    bodyFont: "'Barlow', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Bebas+Neue&display=swap',
    radius: '0',
    dark: true,
  },
  'clean-presence': {
    id: 'clean-presence',
    primary: '#0a3d45',
    accent: '#e8913a',
    onPrimary: '#ffffff',
    bg: '#f4f7f8',
    surface: '#ffffff',
    fg: '#0a3d45',
    muted: '#5a7278',
    inverseBg: '#0a3d45',
    inverseFg: '#f4f7f8',
    border: 'rgba(10,61,69,0.12)',
    displayFont: "'Fraunces', Georgia, serif",
    bodyFont: "'Manrope', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap',
    radius: '0.75rem',
    dark: false,
  },
  'premium-showcase': {
    id: 'premium-showcase',
    primary: '#4a0e1f',
    accent: '#e4d5b0',
    onPrimary: '#faf6f2',
    bg: '#faf6f2',
    surface: '#ffffff',
    fg: '#3a1c22',
    muted: '#6b4a52',
    inverseBg: '#4a0e1f',
    inverseFg: '#faf6f2',
    border: 'rgba(74,14,31,0.12)',
    displayFont: "'Cormorant Garamond', Georgia, serif",
    bodyFont: "'Outfit', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Outfit:wght@300;400;500;600&display=swap',
    radius: '0',
    dark: false,
  },
  'elegant-serif': {
    id: 'elegant-serif',
    primary: '#121212',
    accent: '#b09a6b',
    onPrimary: '#ffffff',
    bg: '#f5f2eb',
    surface: '#ffffff',
    fg: '#121212',
    muted: '#6b6560',
    inverseBg: '#121212',
    inverseFg: '#f5f2eb',
    border: 'rgba(18,18,18,0.12)',
    displayFont: "'Newsreader', Georgia, serif",
    bodyFont: "'Figtree', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&display=swap',
    radius: '0',
    dark: false,
  },
  'sleek-glass': {
    id: 'sleek-glass',
    primary: '#2dd4bf',
    accent: '#5eead4',
    onPrimary: '#070b12',
    bg: '#070b12',
    surface: '#0d1420',
    fg: '#e2e8f0',
    muted: '#94a3b8',
    inverseBg: '#05080e',
    inverseFg: '#e2e8f0',
    border: 'rgba(255,255,255,0.1)',
    displayFont: "'Sora', system-ui, sans-serif",
    bodyFont: "'DM Sans', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Sora:wght@400;500;600;700&display=swap',
    radius: '1rem',
    dark: true,
  },
  'neon-dark': {
    id: 'neon-dark',
    primary: '#22d3ee',
    accent: '#a3e635',
    onPrimary: '#020617',
    bg: '#020617',
    surface: '#0b1224',
    fg: '#e2e8f0',
    muted: '#94a3b8',
    inverseBg: '#01040d',
    inverseFg: '#e2e8f0',
    border: 'rgba(34,211,238,0.25)',
    displayFont: "'Orbitron', system-ui, sans-serif",
    bodyFont: "'Rajdhani', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap',
    radius: '0.35rem',
    dark: true,
  },
  'royal-glow': {
    id: 'royal-glow',
    primary: '#800020',
    accent: '#D4AF37',
    onPrimary: '#ffffff',
    bg: '#FFFFF0',
    surface: '#ffffff',
    fg: '#1a1a1a',
    muted: '#6b5a5e',
    inverseBg: '#1a1a1a',
    inverseFg: '#FFFFF0',
    border: 'rgba(128,0,32,0.12)',
    displayFont: "'Cinzel', 'Playfair Display', Georgia, serif",
    bodyFont: "'Poppins', 'Mukta', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&family=Mukta:wght@300;400;500;600&display=swap',
    radius: '0.75rem',
    dark: false,
  },
};

export function getThemeSkin(templateId?: string | null, primaryOverride?: string): ThemeSkin {
  const base = SKINS[templateId || 'default'] || SKINS.default;
  if (primaryOverride && primaryOverride.trim()) {
    const primary = primaryOverride.trim();
    // Keep readable button text when company overrides primary
    const onPrimary = base.dark ? base.onPrimary : '#ffffff';
    return { ...base, primary, onPrimary };
  }
  return base;
}
