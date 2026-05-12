import type { MetadataRoute } from 'next'
import { PACKS } from '@/data/packs'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gamefolio.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  // Pages statiques publiques — indexer en priorité pour le SEO.
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,        lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/terms`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // Une page par caisse — chaque caisse est une page d'atterrissage potentielle
  // pour les requêtes du type "ouvrir caisse Kanto Pokémon".
  const packPages: MetadataRoute.Sitemap = PACKS.map(pack => ({
    url:            `${SITE_URL}/game/open/${pack.id}`,
    lastModified:   now,
    changeFrequency: 'weekly' as const,
    priority:       0.8,
  }))

  return [...staticPages, ...packPages]
}
