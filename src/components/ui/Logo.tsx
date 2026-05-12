import Image from 'next/image'

// Le PNG du wordmark a un ratio ~3.6:1 (texte + dot-gem en "i"). On le
// déduit ici pour calculer la largeur automatiquement à partir d'une
// hauteur passée par le consommateur. À ajuster si tu re-génères le
// wordmark dans un autre ratio.
const WORDMARK_RATIO = 3.6

interface MarkProps {
  size?: number
  className?: string
  /** Texte alternatif. Vide quand affiché à côté du wordmark (évite la lecture en double par les SR). */
  alt?: string
}

export function LogoMark({ size = 32, className, alt = 'GameFolio' }: MarkProps) {
  return (
    <Image
      src="/logo-mark.png"
      alt={alt}
      width={size}
      height={size}
      priority
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}

interface WordmarkProps {
  height?: number
  className?: string
  alt?: string
}

export function LogoWordmark({ height = 24, className, alt = 'GameFolio' }: WordmarkProps) {
  const width = Math.round(height * WORDMARK_RATIO)
  return (
    <Image
      src="/logo-wordmark.png"
      alt={alt}
      width={width}
      height={height}
      priority
      className={className}
      style={{ height, width: 'auto', objectFit: 'contain' }}
    />
  )
}

interface LogoProps {
  /** Hauteur du mark. Le wordmark est calé sur ~75% de cette hauteur. */
  height?: number
  className?: string
}

export function Logo({ height = 32, className }: LogoProps) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
    >
      <LogoMark size={height} alt="" />
      <LogoWordmark height={Math.round(height * 0.75)} />
    </span>
  )
}
