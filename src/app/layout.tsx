import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://gamefolio.app"),
  title: {
    default: "GameFolio — Le casino TCG Pokémon premium",
    template: "%s · GameFolio",
  },
  description:
    "Ouvre des caisses Pokémon, joue à la roue d'upgrade, défie d'autres joueurs en battle PvP, tente le jackpot communautaire. $10 offerts à l'inscription.",
  keywords: [
    "caisses Pokémon",
    "lootbox TCG",
    "casino TCG",
    "PSA grade",
    "roue upgrade",
    "battle PvP",
    "jackpot communautaire",
    "GameFolio",
  ],
  // openGraph.images, twitter.images, et icons sont générés automatiquement
  // par Next.js via les conventions src/app/{icon,apple-icon,opengraph-image,
  // twitter-image}.tsx — pas besoin de les déclarer manuellement.
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "GameFolio",
    title: "GameFolio — Casino TCG Pokémon",
    description:
      "Caisses thématiques, roue d'upgrade, battles PvP, jackpot communautaire. $10 offerts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GameFolio — Casino TCG Pokémon",
    description: "Caisses, roue d'upgrade, battles PvP, jackpot. $10 offerts.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://gamefolio.app" },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
