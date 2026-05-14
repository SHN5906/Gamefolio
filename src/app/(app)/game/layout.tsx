import { LiveDropsRail } from "@/components/game/LiveDropsRail";

// Layout /game/* : juste le contenu central + le rail des drops à droite.
// La nav primaire (5 modes) et secondaire (Collection/Missions/Boutique/
// Profile) sont maintenant intégrées DIRECTEMENT dans la Topbar globale
// (cf. (app)/layout.tsx → Topbar). On a retiré la GameModeTabs séparée
// pour éliminer le risque qu'un stacking context, cache build ou
// hydratation foireuse fasse disparaître la nav.
export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0">
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex-1 relative">{children}</div>
      </div>
      {/* Rail des drops live à droite — pattern Hellcase. */}
      <LiveDropsRail />
    </div>
  );
}
