import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.tcgdex.net' },
      { protocol: 'https', hostname: '*.tcgdex.net' },
      { protocol: 'https', hostname: 'www.pokemon.com' },
      // pokemontcg.io CDN — images des cartes officielles (marché, insights)
      { protocol: 'https', hostname: 'images.pokemontcg.io' },
      // Supabase Storage pour les photos uploadées par les users
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig
