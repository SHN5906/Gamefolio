import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { CoachWidget } from '@/components/coach/CoachWidget'

// Layout commun à toutes les pages de l'app
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
      {/* Sidebar : visible >= md */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

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
  )
}
