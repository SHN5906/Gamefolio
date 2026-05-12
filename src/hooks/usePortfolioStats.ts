'use client'

// Hook qui calcule les KPIs du dashboard depuis les vraies données
// (cartes + scellés + dernière snapshot) — fallback sur les mocks en démo.

import { useMemo } from 'react'
import { useCollectionData } from './useCollectionData'

export interface PortfolioStats {
  totalValue:    number
  totalCost:     number
  pnl:           number
  pnlPct:        number
  cardCount:     number
  setCount:      number
  gradedCount:   number
  topAsset:      { name: string; value: number; grade: string | null } | null
  topMover:      { name: string; changePct: number } | null
  isLoading:     boolean
  isDemo:        boolean
}

export function usePortfolioStats(): PortfolioStats {
  const { cards, sealed, isLoading, isDemo } = useCollectionData()

  return useMemo(() => {
    const cardsValue   = cards.reduce((acc, c) => acc + (c.current_price_eur ?? 0) * c.quantity, 0)
    const sealedValue  = sealed.reduce((acc, s) => acc + (s.current_value_eur ?? 0) * s.quantity, 0)
    const cardsCost    = cards.reduce((acc, c) => acc + (c.purchase_price_eur ?? 0) * c.quantity, 0)
    const sealedCost   = sealed.reduce((acc, s) => acc + (s.purchase_price_eur ?? 0) * s.quantity, 0)

    const totalValue = cardsValue + sealedValue
    const totalCost  = cardsCost + sealedCost
    const pnl        = totalValue - totalCost
    const pnlPct     = totalCost > 0 ? (pnl / totalCost) * 100 : 0

    const cardCount  = cards.reduce((acc, c) => acc + c.quantity, 0)
    const sets       = new Set(cards.map(c => c.set_name_fr ?? c.set_name_en).filter(Boolean))
    const graded     = cards.filter(c => c.graded).length

    // Top asset = carte de plus grande valeur
    let topAsset: PortfolioStats['topAsset'] = null
    cards.forEach(c => {
      const v = (c.current_price_eur ?? 0) * c.quantity
      if (!topAsset || v > topAsset.value) {
        topAsset = {
          name: c.name_fr ?? c.name_en ?? 'Carte',
          value: v,
          grade: c.grade,
        }
      }
    })

    return {
      totalValue,
      totalCost,
      pnl,
      pnlPct,
      cardCount,
      setCount:    sets.size,
      gradedCount: graded,
      topAsset,
      topMover:    null, // TODO: nécessite l'historique de prix
      isLoading,
      isDemo,
    }
  }, [cards, sealed, isLoading, isDemo])
}
