/** P&L absolu et pourcentage d'une ligne de collection */
export function computePnL(
  currentPrice: number,
  purchasePrice: number,
  quantity: number
): { pnl: number; pnlPct: number } {
  const pnl = (currentPrice - purchasePrice) * quantity
  const pnlPct = purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0
  return { pnl, pnlPct }
}

/** Variation entre deux valeurs */
export function computeChange(
  previous: number,
  current: number
): { diff: number; pct: number } {
  const diff = current - previous
  const pct = previous > 0 ? (diff / previous) * 100 : 0
  return { diff, pct }
}
