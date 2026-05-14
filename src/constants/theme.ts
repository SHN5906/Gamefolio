// Design tokens GameFolio — casino-grade dark glass
// Utilisés dans globals.css (CSS vars) ET ici pour typage TypeScript

export const colors = {
  bg: {
    base: '#060810',
    surface: '#0C1018',
    glass: 'rgba(255,255,255,0.03)',
    glassHi: 'rgba(255,255,255,0.055)',
  },
  border: {
    DEFAULT: 'rgba(255,255,255,0.07)',
    strong: 'rgba(255,255,255,0.13)',
  },
  text: {
    primary: '#F8FAFC',
    secondary: 'rgba(248,250,252,0.55)',
    muted: 'rgba(248,250,252,0.28)',
  },
  accent: {
    positive: '#10B981',
    negative: '#EF4444',
    warning: '#F59E0B',
  },
  brand: {
    DEFAULT: '#1A6FFF',
    hi: '#4A9AFF',
    glow: 'rgba(26,111,255,0.45)',
    soft: 'rgba(26,111,255,0.15)',
  },
  blue: {
    DEFAULT: '#00C3FF',
    soft: 'rgba(0,195,255,0.13)',
  },
  pokemonYellow: {
    DEFAULT: '#FFCC00',
    soft: 'rgba(255,204,0,0.15)',
  },
} as const

export const fontFamily = {
  display: ['Space Grotesk', 'sans-serif'],
  mono: ['IBM Plex Mono', 'monospace'],
  body: ['Figtree', 'sans-serif'],
} as const

// Couleurs par type d'énergie Pokémon (pour les card art placeholders)
export const energyColors = {
  fire:      { from: '#7C2D12', via: '#C2410C', to: '#FCD34D' },
  psychic:   { from: '#1E1B4B', via: '#4338CA', to: '#C084FC' },
  lightning: { from: '#713F12', via: '#CA8A04', to: '#FEF08A' },
  water:     { from: '#0C4A6E', via: '#0369A1', to: '#7DD3FC' },
  grass:     { from: '#14532D', via: '#15803D', to: '#86EFAC' },
  fighting:  { from: '#431407', via: '#9A3412', to: '#FCA5A5' },
  dark:      { from: '#0F172A', via: '#1E293B', to: '#7C3AED' },
  colorless: { from: '#374151', via: '#6B7280', to: '#D1D5DB' },
} as const

export type EnergyType = keyof typeof energyColors
