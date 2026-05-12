const SHORT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const FULL  = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

/** "14 avr." */
export function formatDateShort(date: string | Date): string {
  return SHORT.format(new Date(date))
}

/** "14 avril 2025" */
export function formatDateFull(date: string | Date): string {
  return FULL.format(new Date(date))
}

/** Retourne "il y a 2 heures", "il y a 3 jours", etc. */
export function formatRelative(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1)   return 'à l\'instant'
  if (minutes < 60)  return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30)     return `il y a ${days} j`
  return formatDateShort(date)
}
