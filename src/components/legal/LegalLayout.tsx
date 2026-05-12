import Link from "next/link";
import { LogoMark, LogoWordmark } from "@/components/ui/Logo";

export function LegalLayout({
  title,
  lastUpdate,
  children,
}: {
  title: string;
  lastUpdate: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative" style={{ zIndex: 1 }}>
      {/* Nav */}
      <nav
        className="px-6 md:px-10 py-5 border-b"
        style={{
          background: "rgba(5,7,16,0.72)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={32} alt="" />
            <LogoWordmark height={20} />
          </Link>
          <Link
            href="/"
            className="text-[12px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← Retour
          </Link>
        </div>
      </nav>

      <article className="px-6 md:px-10 py-12 max-w-3xl mx-auto">
        <p
          className="text-[10px] font-semibold uppercase tracking-[1.3px] mb-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          Document légal · Mis à jour le {lastUpdate}
        </p>
        <h1
          className="text-[36px] md:text-[44px] font-extrabold tracking-tight leading-tight mb-8"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.025em",
          }}
        >
          {title}
        </h1>
        <div className="prose prose-invert max-w-none">{children}</div>
      </article>

      <footer
        className="px-6 md:px-10 py-8 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span>© 2026 GameFolio · 18+</span>
          <div className="flex gap-4">
            <Link href="/privacy" style={{ color: "var(--color-text-muted)" }}>
              Confidentialité
            </Link>
            <Link href="/terms" style={{ color: "var(--color-text-muted)" }}>
              CGU
            </Link>
            <a
              href="mailto:hello@gamefolio.app"
              style={{ color: "var(--color-text-muted)" }}
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
