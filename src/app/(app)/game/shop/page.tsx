"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingCart, Zap, Star, Crown, Gem } from "lucide-react";
import { useBalance } from "@/hooks/useGame";
import { toast } from "@/components/ui/Toaster";

interface ShopBundle {
  id: string;
  amount: number; // dollars in jeu
  price: number; // dollars réels
  bonus: number; // % bonus
  popular?: boolean;
  best?: boolean;
  icon: React.ReactNode;
  color: string;
  glow: string;
}

const BUNDLES: ShopBundle[] = [
  {
    id: "small",
    amount: 5,
    price: 4.99,
    bonus: 0,
    icon: <Zap size={18} />,
    color: "#5B7FFF",
    glow: "rgba(91,127,255,0.35)",
  },
  {
    id: "medium",
    amount: 12,
    price: 9.99,
    bonus: 20,
    icon: <Star size={18} />,
    color: "#10D9A0",
    glow: "rgba(16,217,160,0.35)",
    popular: true,
  },
  {
    id: "large",
    amount: 30,
    price: 19.99,
    bonus: 50,
    icon: <Gem size={18} />,
    color: "#A855F7",
    glow: "rgba(168,85,247,0.35)",
  },
  {
    id: "huge",
    amount: 80,
    price: 49.99,
    bonus: 60,
    icon: <Crown size={18} />,
    color: "#FFD700",
    glow: "rgba(255,215,0,0.4)",
    best: true,
  },
  {
    id: "mega",
    amount: 200,
    price: 99.99,
    bonus: 100,
    icon: <Crown size={18} />,
    color: "#EC4899",
    glow: "rgba(236,72,153,0.4)",
  },
];

export default function ShopPage() {
  const { balance, addBalance } = useBalance();

  const handlePurchase = (b: ShopBundle) => {
    // Démo : crédit direct côté client. Stripe sera branché en Phase 2
    // (cf. DEPLOY.md §3) — le bouton enverra alors vers Stripe Checkout.
    const totalCredit = b.amount + (b.amount * b.bonus) / 100;
    addBalance(totalCredit);
    toast.success(
      `+$${totalCredit.toFixed(2)} crédités`,
      `Pack ${b.id} acheté · bonus ${b.bonus}% inclus`,
    );
  };

  return (
    <div
      className="min-h-full page-enter"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div
        className="px-4 sm:px-6 md:px-8 pt-6 pb-16 mx-auto"
        style={{ maxWidth: 1100 }}
      >
        <Link
          href="/game"
          className="flex items-center gap-2 text-[12px] font-medium mb-5 transition-colors hover:text-[var(--color-text-primary)]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <ArrowLeft size={13} />
          Retour
        </Link>

        {/* Header */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart
                size={14}
                style={{ color: "var(--color-purple)" }}
              />
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.4px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Boutique · Recharge ton solde
              </p>
            </div>
            <h1
              className="text-[28px] sm:text-[32px] font-extrabold tracking-tight leading-none"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
                letterSpacing: "-0.03em",
              }}
            >
              Achète des dollars
            </h1>
            <p
              className="text-[13px] mt-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Solde actuel :{" "}
              <strong style={{ color: "var(--color-positive)" }}>
                ${balance.toFixed(2)}
              </strong>
              {" · "}
              Le jeu reste 100% jouable gratuitement.
            </p>
          </div>
        </div>

        {/* Bundles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUNDLES.map((b) => (
            <BundleCard
              key={b.id}
              bundle={b}
              onPurchase={() => handlePurchase(b)}
            />
          ))}
        </div>

        {/* Trust signals */}
        <div
          className="mt-10 rounded-[var(--radius-md)] border p-5"
          style={{
            background: "var(--color-bg-glass)",
            borderColor: "var(--color-border)",
          }}
        >
          <h3
            className="text-[14px] font-bold mb-3"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Sans pay-to-win
          </h3>
          <ul
            className="space-y-2 text-[12px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <li>
              • Toutes les cartes sont accessibles via les caisses gratuites +
              missions
            </li>
            <li>• Aucune carte exclusive aux joueurs payants</li>
            <li>
              • Les achats donnent juste plus d&apos;ouvertures, pas
              d&apos;avantage
            </li>
            <li>• 50 caisses gratuites chaque jour, ad vitam</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function BundleCard({
  bundle,
  onPurchase,
}: {
  bundle: ShopBundle;
  onPurchase: () => void;
}) {
  const totalCredit = bundle.amount + (bundle.amount * bundle.bonus) / 100;

  return (
    <div
      className="relative rounded-[var(--radius-md)] border p-5 flex flex-col transition-all hover:scale-[1.02]"
      style={{
        background:
          bundle.best || bundle.popular
            ? `linear-gradient(155deg, ${bundle.color}15, var(--color-bg-elevated))`
            : "var(--color-bg-elevated)",
        borderColor: bundle.best
          ? bundle.color
          : bundle.popular
            ? `${bundle.color}55`
            : "var(--color-border-strong)",
        boxShadow: bundle.best
          ? `0 0 32px ${bundle.glow}`
          : bundle.popular
            ? `0 0 16px ${bundle.glow}`
            : "var(--shadow-sm)",
      }}
    >
      {/* Badge */}
      {(bundle.popular || bundle.best) && (
        <span
          className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-[1.4px]"
          style={{
            background: bundle.color,
            color: bundle.best ? "#000" : "#fff",
            boxShadow: `0 0 12px ${bundle.glow}`,
          }}
        >
          {bundle.best ? "BEST DEAL" : "POPULAIRE"}
        </span>
      )}

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-[var(--radius-sm)] flex items-center justify-center mb-4"
        style={{ background: `${bundle.color}22`, color: bundle.color }}
      >
        {bundle.icon}
      </div>

      {/* Amount */}
      <p
        className="text-[10px] font-semibold uppercase tracking-[1.2px]"
        style={{ color: "var(--color-text-muted)" }}
      >
        Tu reçois
      </p>
      <p
        className="text-[34px] font-extrabold leading-none tabular-nums mt-1"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
          letterSpacing: "-0.03em",
        }}
      >
        ${totalCredit.toFixed(2)}
      </p>
      {bundle.bonus > 0 && (
        <p
          className="text-[11px] mt-1 font-semibold"
          style={{ color: "var(--color-positive)" }}
        >
          ${bundle.amount.toFixed(2)} + $
          {((bundle.amount * bundle.bonus) / 100).toFixed(2)} bonus (
          {bundle.bonus}%)
        </p>
      )}

      {/* Spacer */}
      <div className="flex-1 min-h-4" />

      {/* Price + CTA */}
      <button
        onClick={onPurchase}
        className="w-full h-11 rounded-[var(--radius-sm)] font-bold text-[14px] text-white transition-all hover:scale-[1.02]"
        style={{
          fontFamily: "var(--font-display)",
          background: `linear-gradient(135deg, ${bundle.color}, ${bundle.color}DD)`,
          boxShadow: `0 0 16px ${bundle.glow}`,
        }}
      >
        Acheter · ${bundle.price.toFixed(2)}
      </button>
    </div>
  );
}
