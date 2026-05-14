import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CoachWidget } from "@/components/coach/CoachWidget";

// Layout commun à toutes les pages de l'app
//
// Note ergonomie (14/05) : le Sidebar 60px gauche a été retiré pour libérer
// de la largeur de contenu et éliminer la nav doublée (Jeu/Battles/Jackpot
// existaient dans Sidebar ET dans GameModeTabs). Les items secondaires
// (Collection/Missions/Boutique/Profile) ont été déplacés dans la Topbar.
// LiveDropsRail passe à droite (pattern Hellcase). MobileNav < md garde
// la nav inchangée sur mobile.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom nav mobile : visible < md */}
      <MobileNav />

      {/* Prism — coach IA flottant, toutes pages /game/* */}
      <CoachWidget />
    </div>
  );
}
