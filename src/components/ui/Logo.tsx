// Système de logo 100% SVG inline.
// Pas de dépendance à un PNG externe → pas de watermark, fond transparent
// natif, crisp à toutes les tailles, ~1 KB compressé.

interface PrismProps {
  size?: number;
  className?: string;
  /** Désactive le halo extérieur (favicon / contextes contraints). */
  noGlow?: boolean;
  /** ID unique pour les `<defs>` SVG (évite les conflits si plusieurs instances). */
  idPrefix?: string;
}

/**
 * Prisme hexagonal holographique — vue isométrique d'un cube avec 3 facettes
 * iridescentes. Reproduction vectorielle du visuel Nano Banana.
 */
export function PrismSVG({
  size = 32,
  className,
  noGlow = false,
  idPrefix,
}: PrismProps) {
  // Préfixe pseudo-unique pour les IDs des gradients/filtres SVG. Stable au
  // re-render (basé sur size) — pas de Math.random pour rester SSR-safe.
  const id = idPrefix ?? `prism-${size}`;

  // Hexagone centré sur (60, 60), rayon 48, vue isométrique d'un cube.
  // Sommets (point-up) :
  //   top      = (60, 12)
  //   up-right = (101.6, 36)
  //   lo-right = (101.6, 84)
  //   bottom   = (60, 108)
  //   lo-left  = (18.4, 84)
  //   up-left  = (18.4, 36)
  //   center   = (60, 60)
  const TOP_FACET = "60,12 101.6,36 60,60 18.4,36";
  const RIGHT_FACET = "101.6,36 101.6,84 60,108 60,60";
  const LEFT_FACET = "18.4,36 60,60 60,108 18.4,84";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-top`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="55%" stopColor="#FF4DA6" />
          <stop offset="100%" stopColor="#FFD740" />
        </linearGradient>
        <linearGradient id={`${id}-right`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2A7DFF" />
          <stop offset="50%" stopColor="#A36AFF" />
          <stop offset="100%" stopColor="#FF4DA6" />
        </linearGradient>
        <linearGradient id={`${id}-left`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FF4DA6" />
          <stop offset="55%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#FFD740" />
        </linearGradient>

        {!noGlow && (
          <filter
            id={`${id}-glow`}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feFlood floodColor="#00D4FF" floodOpacity="0.55" />
            <feComposite in2="b" operator="in" result="c" />
            <feMerge>
              <feMergeNode in="c" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <g filter={noGlow ? undefined : `url(#${id}-glow)`}>
        <polygon
          points={TOP_FACET}
          fill={`url(#${id}-top)`}
          stroke="white"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <polygon
          points={RIGHT_FACET}
          fill={`url(#${id}-right)`}
          stroke="white"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <polygon
          points={LEFT_FACET}
          fill={`url(#${id}-left)`}
          stroke="white"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </g>

      {/* Lens flare au sommet supérieur-droit */}
      <g transform="translate(101.6,36)" opacity="0.95">
        <path
          d="M0,-10 L1.6,-1.6 L10,0 L1.6,1.6 L0,10 L-1.6,1.6 L-10,0 L-1.6,-1.6 Z"
          fill="white"
        />
        <circle r="2.8" fill="white" />
      </g>
    </svg>
  );
}

// ── API publique ────────────────────────────────────────────────────────

interface MarkProps {
  size?: number;
  className?: string;
  noGlow?: boolean;
  /** Compat : ancien prop, ignoré (le SVG n'a pas besoin d'alt-text séparé, aria-hidden). */
  alt?: string;
}

export function LogoMark({ size = 32, className, noGlow = false }: MarkProps) {
  return <PrismSVG size={size} className={className} noGlow={noGlow} />;
}

interface WordmarkProps {
  height?: number;
  className?: string;
  /** Hexa CSS du texte. Par défaut blanc. */
  color?: string;
}

export function LogoWordmark({
  height = 24,
  className,
  color = "#FFFFFF",
}: WordmarkProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        fontFamily: 'var(--font-display, "Inter Tight", system-ui, sans-serif)',
        fontWeight: 900,
        fontSize: height,
        lineHeight: 1,
        letterSpacing: "-0.045em",
        color,
        whiteSpace: "nowrap",
      }}
    >
      GameFolio
    </span>
  );
}

interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 32, className }: LogoProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.round(height * 0.32),
      }}
    >
      <LogoMark size={height} />
      <LogoWordmark height={Math.round(height * 0.65)} />
    </span>
  );
}
