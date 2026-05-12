import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionCard } from "@/components/cards/CollectionCard";
import { fetchPublicProfile, fetchPublicCollection } from "@/lib/data/public";
import { formatEur } from "@/utils/formatCurrency";
import { Heart, Eye, Share2, Sparkles } from "lucide-react";
import { env } from "@/constants/env";
import type { MockCard } from "@/lib/mock";
import type { UserCardRow } from "@/lib/data/cards";

interface PageProps {
  params: Promise<{ username: string }>;
}

function rowToMockCard(r: UserCardRow): MockCard {
  return {
    id: r.id,
    name: r.name_fr ?? r.name_en ?? "Carte",
    set: r.set_name_fr ?? r.set_name_en ?? "—",
    number: r.catalog_number ?? "",
    energy: (r.types?.[0]?.toLowerCase() ?? "colorless") as MockCard["energy"],
    condition: r.condition,
    language: r.language.toUpperCase(),
    grade: r.grade,
    value: r.current_price_eur ?? 0,
    changePct: 0,
    purchasePrice: 0, // ← non exposé en public !
    imageUrl: r.image_url_high ?? r.image_url_low ?? null,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;

  if (env.isDemoMode) {
    return <DemoProfile username={username} />;
  }

  const profile = await fetchPublicProfile(username);
  if (!profile) notFound();

  const cards = await fetchPublicCollection(profile.id);
  const totalValue = cards.reduce(
    (acc, c) => acc + (c.current_price_eur ?? 0) * c.quantity,
    0,
  );
  const sets = new Set(
    cards.map((c) => c.set_name_fr ?? c.set_name_en).filter(Boolean),
  );

  return (
    <PublicProfileLayout
      displayName={profile.display_name ?? username}
      username={username}
      avatarUrl={profile.avatar_url}
      memberSince={profile.created_at}
      tier={profile.subscription_tier}
      totalValue={totalValue}
      cardCount={cards.length}
      setCount={sets.size}
      cards={cards.map(rowToMockCard)}
    />
  );
}

// ── Vue démo ────────────────────────────────────────────────────────
function DemoProfile({ username }: { username: string }) {
  const { MOCK_CARDS } = require("@/lib/mock") as typeof import("@/lib/mock");
  const totalValue = MOCK_CARDS.reduce(
    (acc: number, c: { value: number }) => acc + c.value,
    0,
  );
  const sets = new Set(MOCK_CARDS.map((c: { set: string }) => c.set));

  return (
    <PublicProfileLayout
      displayName={username.replace(/_/g, " ")}
      username={username}
      avatarUrl={null}
      memberSince="2025-01-15"
      tier="pro"
      totalValue={totalValue}
      cardCount={MOCK_CARDS.length}
      setCount={sets.size}
      cards={MOCK_CARDS}
    />
  );
}

interface LayoutProps {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  memberSince: string;
  tier: string;
  totalValue: number;
  cardCount: number;
  setCount: number;
  cards: MockCard[];
}

function PublicProfileLayout({
  displayName,
  username,
  avatarUrl,
  memberSince,
  tier,
  totalValue,
  cardCount,
  setCount,
  cards,
}: LayoutProps) {
  const initial = displayName[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen relative" style={{ zIndex: 1 }}>
      {/* Top banner */}
      <div
        className="px-4 sm:px-6 md:px-8 py-3 border-b sticky top-0 z-20"
        style={{
          background: "rgba(5,7,16,0.72)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center text-white text-[11px] font-extrabold"
              style={{
                fontFamily: "var(--font-display)",
                background:
                  "linear-gradient(140deg, var(--color-brand), var(--color-cyan))",
                boxShadow: "0 0 12px var(--color-brand-glow)",
              }}
            >
              GF
            </div>
            <span
              className="text-[13px] font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              GameFolio
            </span>
          </Link>
          <Link
            href="/signup"
            className="text-[12px] font-semibold px-3 py-1.5 rounded-[var(--radius-sm)] text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--color-brand), var(--color-cyan))",
              boxShadow: "0 0 12px var(--color-brand-glow)",
            }}
          >
            Jouer gratuit
          </Link>
        </div>
      </div>

      {/* Profile header */}
      <div className="px-4 sm:px-6 md:px-8 pt-10 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-8">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-[var(--radius-lg)] flex items-center justify-center text-white text-[40px] font-extrabold flex-shrink-0 border-2 overflow-hidden"
              style={{
                fontFamily: "var(--font-display)",
                background: avatarUrl
                  ? "#0B0F1A"
                  : "linear-gradient(140deg, var(--color-brand), var(--color-cyan))",
                borderColor: "var(--color-border-strong)",
                boxShadow: "var(--shadow-lg), 0 0 32px var(--color-brand-glow)",
              }}
            >
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initial
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[1.3px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Collection publique
                </p>
                {tier !== "free" && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                    style={{
                      background: "var(--color-pokemon-yellow-soft)",
                      color: "var(--color-pokemon-yellow)",
                      border: "1px solid rgba(255,204,0,0.3)",
                    }}
                  >
                    <Sparkles size={9} /> {tier}
                  </span>
                )}
              </div>
              <h1
                className="text-[36px] font-extrabold leading-none tracking-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.025em",
                }}
              >
                {displayName}
              </h1>
              <p
                className="text-[12px] mt-2 font-mono"
                style={{ color: "var(--color-text-muted)" }}
              >
                @{username} · Membre depuis{" "}
                {new Date(memberSince).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--radius-sm)] text-[12px] font-semibold border transition-all"
                style={{
                  background: "var(--color-bg-glass)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              >
                <Heart size={12} /> Suivre
              </button>
              <button
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--radius-sm)] text-[12px] font-semibold border transition-all"
                style={{
                  background: "var(--color-bg-glass)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              >
                <Share2 size={12} /> Partager
              </button>
            </div>
          </div>

          {/* Public stats */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-[var(--radius)] overflow-hidden border"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-border)",
            }}
          >
            {[
              {
                lbl: "Valeur estimée",
                val: formatEur(totalValue),
                sub: "cotation Cardmarket",
              },
              {
                lbl: "Cartes",
                val: String(cardCount),
                sub: `${setCount} sets`,
              },
              {
                lbl: "Cartes gradées",
                val: String(cards.filter((c) => c.grade).length),
                sub: "PSA",
              },
              {
                lbl: "Top asset",
                val:
                  cards
                    .sort((a, b) => b.value - a.value)[0]
                    ?.name?.split(" ")
                    .slice(0, 2)
                    .join(" ") ?? "—",
                sub: cards[0] ? formatEur(cards[0].value) : "",
              },
            ].map(({ lbl, val, sub }) => (
              <div
                key={lbl}
                className="px-4 py-3"
                style={{ background: "var(--color-bg-glass)" }}
              >
                <p
                  className="text-[9.5px] font-semibold uppercase tracking-[0.9px] mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {lbl}
                </p>
                <p
                  className="text-[16px] font-bold leading-none truncate"
                  style={{
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {val}
                </p>
                <p
                  className="text-[10px] mt-1"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="px-4 sm:px-6 md:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[18px] font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {cardCount} cartes
            </h2>
            <p
              className="text-[11px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              <Eye size={11} className="inline mr-1" />
              Vue publique · sans prix d&apos;achat
            </p>
          </div>
          <div
            className="grid gap-2 sm:gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))",
            }}
          >
            {cards.map((c) => (
              <CollectionCard key={c.id} card={c} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 sm:px-6 md:px-8 pb-16">
        <div
          className="max-w-3xl mx-auto rounded-[var(--radius-lg)] border p-7 text-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(42,125,255,0.1) 0%, rgba(0,212,255,0.05) 50%, rgba(11,15,26,0.6) 100%)",
            borderColor: "var(--color-border-strong)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(42,125,255,0.5), transparent)",
            }}
          />
          <h3
            className="text-[24px] font-extrabold tracking-tight mb-2"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.025em",
            }}
          >
            Crée ton propre portfolio Pokémon
          </h3>
          <p
            className="text-[13px] mb-5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Suis la valeur de ta collection en temps réel. Gratuit pour
            démarrer.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-[var(--radius-sm)] text-[14px] font-bold text-white transition-all hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(135deg, var(--color-brand), var(--color-cyan))",
              boxShadow: "0 0 24px var(--color-brand-glow)",
            }}
          >
            Commencer gratuitement →
          </Link>
        </div>
      </div>
    </div>
  );
}
