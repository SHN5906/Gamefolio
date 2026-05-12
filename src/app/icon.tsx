import { ImageResponse } from "next/og";

// Favicon 32×32 — SVG prism rendu inline, posé sur un fond dark navy
// pour rester lisible dans l'onglet du navigateur. Pas de readFile,
// pas de PNG externe : 100% Edge-compatible.
export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const TOP_FACET = "60,12 101.6,36 60,60 18.4,36";
const RIGHT_FACET = "101.6,36 101.6,84 60,108 60,60";
const LEFT_FACET = "18.4,36 60,60 60,108 18.4,84";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0A0E14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
      }}
    >
      <svg width="26" height="26" viewBox="0 0 120 120" fill="none">
        <defs>
          <linearGradient id="t" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="55%" stopColor="#FF4DA6" />
            <stop offset="100%" stopColor="#FFD740" />
          </linearGradient>
          <linearGradient id="r" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A7DFF" />
            <stop offset="50%" stopColor="#A36AFF" />
            <stop offset="100%" stopColor="#FF4DA6" />
          </linearGradient>
          <linearGradient id="l" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FF4DA6" />
            <stop offset="55%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#FFD740" />
          </linearGradient>
        </defs>
        <polygon
          points={TOP_FACET}
          fill="url(#t)"
          stroke="white"
          strokeWidth="2.2"
        />
        <polygon
          points={RIGHT_FACET}
          fill="url(#r)"
          stroke="white"
          strokeWidth="2.2"
        />
        <polygon
          points={LEFT_FACET}
          fill="url(#l)"
          stroke="white"
          strokeWidth="2.2"
        />
      </svg>
    </div>,
    size,
  );
}
