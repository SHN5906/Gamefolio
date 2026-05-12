import { ImageResponse } from "next/og";

// OG image 1200×630 — SVG prism + wordmark texte + tagline, full inline.
// Pas de readFile, runtime Edge.
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "GameFolio — Le casino TCG en monnaie fictive";

const TOP_FACET = "60,12 101.6,36 60,60 18.4,36";
const RIGHT_FACET = "101.6,36 101.6,84 60,108 60,60";
const LEFT_FACET = "18.4,36 60,60 60,108 18.4,84";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        background:
          "radial-gradient(circle at 80% 70%, rgba(42,125,255,0.30), #0A0E14 55%), linear-gradient(180deg, #0A0E14, #0A0E14)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* LEFT — wordmark + tagline */}
      <div
        style={{
          width: 720,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          padding: "0 0 0 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "white",
            fontSize: 88,
            fontWeight: 900,
            letterSpacing: -3,
            lineHeight: 1,
          }}
        >
          GameFolio
        </div>
        <div
          style={{
            display: "flex",
            color: "#F2F4F8",
            fontSize: 38,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 580,
          }}
        >
          Le casino TCG en monnaie fictive.
        </div>
        <div
          style={{
            display: "flex",
            color: "#9CA1B0",
            fontSize: 22,
          }}
        >
          $10 offerts · 100% monnaie fictive · 18+
        </div>
      </div>

      {/* RIGHT — prism SVG inline */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="440" height="440" viewBox="0 0 120 120" fill="none">
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
            strokeWidth="1.4"
          />
          <polygon
            points={RIGHT_FACET}
            fill="url(#r)"
            stroke="white"
            strokeWidth="1.4"
          />
          <polygon
            points={LEFT_FACET}
            fill="url(#l)"
            stroke="white"
            strokeWidth="1.4"
          />
          <g transform="translate(101.6,36)">
            <path
              d="M0,-9 L1.5,-1.5 L9,0 L1.5,1.5 L0,9 L-1.5,1.5 L-9,0 L-1.5,-1.5 Z"
              fill="white"
            />
            <circle r="2.6" fill="white" />
          </g>
        </svg>
      </div>
    </div>,
    size,
  );
}
