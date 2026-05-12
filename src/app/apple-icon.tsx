import { ImageResponse } from 'next/og'

// Apple touch icon 180×180 — SVG prism inline sur radial glow brand.
// Le système iOS masque les coins automatiquement.
export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

const TOP_FACET = '60,12 101.6,36 60,60 18.4,36'
const RIGHT_FACET = '101.6,36 101.6,84 60,108 60,60'
const LEFT_FACET = '18.4,36 60,60 60,108 18.4,84'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(circle at 30% 25%, rgba(42,125,255,0.55), #0A0E14 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="140" height="140" viewBox="0 0 120 120" fill="none">
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
          <polygon points={TOP_FACET}   fill="url(#t)" stroke="white" strokeWidth="1.8" />
          <polygon points={RIGHT_FACET} fill="url(#r)" stroke="white" strokeWidth="1.8" />
          <polygon points={LEFT_FACET}  fill="url(#l)" stroke="white" strokeWidth="1.8" />
          <g transform="translate(101.6,36)">
            <path d="M0,-10 L1.6,-1.6 L10,0 L1.6,1.6 L0,10 L-1.6,1.6 L-10,0 L-1.6,-1.6 Z" fill="white" />
            <circle r="3" fill="white" />
          </g>
        </svg>
      </div>
    ),
    size,
  )
}
