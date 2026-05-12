import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/providers'

export const metadata: Metadata = {
  title: 'CardFolio — Ta collection, en portefeuille.',
  description:
    'Suis la valeur de ta collection de cartes Pokémon TCG comme un portefeuille financier. Valorisation temps réel, courbes, P&L — en euros, en français.',
  keywords: ['Pokémon TCG', 'collection', 'portfolio', 'Cardmarket', 'cote'],
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
