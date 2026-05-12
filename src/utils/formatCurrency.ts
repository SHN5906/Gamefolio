// Formatage monétaire — EUR par défaut, notation française

const EUR = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const EUR_COMPACT = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** "3 847,50 €" */
export function formatEur(value: number): string {
  return EUR.format(value)
}

/** "+124,80 €" ou "-12,00 €" avec signe explicite */
export function formatEurDiff(value: number): string {
  const formatted = EUR.format(Math.abs(value))
  return value >= 0 ? `+${formatted}` : `-${formatted}`
}

/** "+3,35 %" */
export function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2).replace('.', ',')} %`
}

/** "3,8K €" pour affichage compact */
export function formatEurCompact(value: number): string {
  return EUR_COMPACT.format(value)
}

// ── USD (monnaie du jeu GameFolio) ────────────────────────────────────────

/** "$1,234.56" — notation simple et compacte, sans Intl pour rester ultra-léger */
export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`
}

/** "+$10.00" / "−$2.50" avec signe explicite */
export function formatUsdDiff(value: number): string {
  if (value >= 0) return `+$${value.toFixed(2)}`
  return `−$${Math.abs(value).toFixed(2)}`
}
