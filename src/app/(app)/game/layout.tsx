import { GameModeTabs } from "@/components/game/GameModeTabs";
import { LiveDropsRail } from "@/components/game/LiveDropsRail";

// Layout signature Hellcase pour /game/* :
//  - Rail vertical de drops persistant à gauche (lg+)
//  - Tabs horizontaux de modes de jeu en haut (sticky)
// Le scroll appartient au container enfant — pas au main parent — pour que
// la barre de tabs reste collée pendant le scroll de page.
export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0">
      <LiveDropsRail />
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Tabs wrapper avec z-index élevé pour s'assurer qu'aucun
            JackpotCounter, modale ou stacking context enfant ne passe
            par-dessus. La barre est sticky → toujours visible en haut
            du scroll. */}
        <GameModeTabs />
        <div className="flex-1 relative">{children}</div>
      </div>
    </div>
  );
}
