'use client'

import { useQuery } from '@tanstack/react-query'
import { env } from '@/constants/env'
import { fetchWishlist, type WishlistRow } from '@/lib/data/wishlist'
import { MOCK_WISHLIST, type MockWishItem } from '@/lib/mock'

// ── Adapter mock → row ─────────────────────────────────────────────
function mockToRow(m: MockWishItem): WishlistRow {
  return {
    id:                m.id,
    user_id:           'demo',
    card_id:           m.id,
    language:          'fr',
    variant:           'normal',
    condition:         'NM',
    priority:          m.priority,
    target_price_eur:  m.targetPrice,
    max_price_eur:     m.maxPrice,
    alert_enabled:     m.targetPrice !== null,
    notes:             m.notes,
    created_at:        m.addedAt,
    name_fr:           m.name,
    name_en:           m.name,
    set_name_fr:       m.set,
    set_name_en:       m.set,
    catalog_number:    m.number,
    image_url_low:     m.tcgdexImage,
    current_price_eur: m.currentPrice,
  }
}

export function useWishlistData() {
  const q = useQuery<WishlistRow[]>({
    queryKey: ['wishlist'],
    queryFn: async () => env.isDemoMode ? MOCK_WISHLIST.map(mockToRow) : fetchWishlist(),
    staleTime: 30_000,
  })

  return {
    items:     q.data ?? [],
    isLoading: q.isLoading,
    isDemo:    env.isDemoMode,
    error:     q.error,
  }
}
