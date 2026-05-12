import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/providers'

export const metadata: Metadata = {
  metadataBase: new URL('https://gamefolio.app'),
  title: {
    default: 'GameFolio — Ouvre des caisses TCG, sans débourser un centime',
    template: '%s · GameFolio',
  },
  description:
    'Le casino TCG en monnaie fictive. Ouvre des caisses, joue à la roue d\'upgrade, défie d\'autres joueurs en battle PvP. $10 offerts à l\'inscription, gratuit à vie.',
  keywords: [
    'caisses Pokémon', 'lootbox TCG', 'casino fictif', 'PSA grade',
    'roue upgrade', 'battle PvP', 'jackpot communautaire', 'GameFolio',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'GameFolio',
    title: 'GameFolio — Ouvre des caisses TCG en monnaie fictive',
    description: 'Le casino TCG en monnaie fictive. Caisses, roue d\'upgrade, battles PvP, jackpot.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GameFolio — Casino TCG en monnaie fictive',
    description: 'Caisses, roue d\'upgrade, battles PvP, jackpot. $10 offerts.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://gamefolio.app' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
