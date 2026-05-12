import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.tcgdex.net" },
      { protocol: "https", hostname: "*.tcgdex.net" },
      { protocol: "https", hostname: "www.pokemon.com" },
      { protocol: "https", hostname: "images.pokemontcg.io" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },

  // Headers de sécurité — recommandés pour un produit qui touche à de la
  // « monnaie virtuelle ». Pas de SRI/CSP fort pour l'instant : à durcir
  // une fois Supabase Auth en place.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  // Redirections 301 permanentes — l'app n'est plus un portfolio, toutes
  // les anciennes routes pointent vers le jeu.
  async redirects() {
    return [
      { source: "/dashboard", destination: "/game", permanent: true },
      { source: "/add", destination: "/game", permanent: true },
      { source: "/add/:rest*", destination: "/game", permanent: true },
      { source: "/wishlist", destination: "/game", permanent: true },
      { source: "/wishlist/:rest*", destination: "/game", permanent: true },
      { source: "/insights", destination: "/game", permanent: true },
      {
        source: "/collection",
        destination: "/game/collection",
        permanent: true,
      },
      { source: "/card/:id", destination: "/game/collection", permanent: true },
    ];
  },
};

export default nextConfig;
