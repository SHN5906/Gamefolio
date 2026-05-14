"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardArt } from "@/components/cards/CardArt";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});
type FormData = z.infer<typeof schema>;

// Cartes déco affichées derrière la form
const DECO_CARDS = [
  {
    energy: "fire" as const,
    rotate: "-rotate-6",
    scale: "scale-90",
    opacity: "opacity-60",
  },
  {
    energy: "psychic" as const,
    rotate: "rotate-3",
    scale: "scale-100",
    opacity: "opacity-80",
  },
  {
    energy: "lightning" as const,
    rotate: "rotate-12",
    scale: "scale-75",
    opacity: "opacity-40",
  },
];

// ── Sous-composant qui lit les searchParams ────────────────────────
// Doit être wrappé dans Suspense (Next.js App Router requirement)
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirm") === "1";

  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setAuthError(null);

    // Si Supabase n'est pas configuré, on redirige directement (mode démo)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      router.push("/game");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setAuthError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/game");
    router.refresh();
  };

  return (
    <>
      {/* Confirmation email */}
      {confirmed && (
        <div
          className="mb-4 px-3 py-2.5 rounded-[var(--radius-sm)] text-[12px]"
          style={{
            background: "var(--color-positive-soft)",
            color: "var(--color-positive)",
          }}
        >
          Email de confirmation envoyé — vérifie ta boîte mail.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        <Input
          label="Email"
          type="email"
          placeholder="hugo@exemple.fr"
          autoComplete="email"
          icon={<Mail size={14} />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          icon={<Lock size={14} />}
          error={errors.password?.message}
          {...register("password")}
        />

        {/* Mot de passe oublié */}
        <div className="flex justify-end -mt-1">
          <Link
            href="/forgot-password"
            className="text-[11px] transition-colors duration-150 hover:text-[var(--color-brand)]"
            style={{ color: "var(--color-text-muted)" }}
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {authError && (
          <p className="text-[12px]" style={{ color: "var(--color-negative)" }}>
            {authError}
          </p>
        )}

        <Button
          type="submit"
          loading={loading}
          className="w-full mt-1 justify-center"
        >
          Se connecter
          {!loading && <ArrowRight size={14} />}
        </Button>
      </form>
    </>
  );
}

// ── Page principale ────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      {/* ── LOGO ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <LogoMark size={44} alt="" />
        <div>
          <p
            className="text-[18px] font-bold tracking-tight leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            GameFolio
          </p>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            Le casino TCG Pokémon premium.
          </p>
        </div>
      </div>

      {/* ── CARD DÉCO ─────────────────────────────────── */}
      <div className="flex justify-center gap-2 mb-6 h-16 items-end">
        {DECO_CARDS.map(({ energy, rotate, scale, opacity }) => (
          <div
            key={energy}
            className={`${rotate} ${scale} ${opacity} transition-transform duration-300`}
          >
            <CardArt energy={energy} size="md" />
          </div>
        ))}
      </div>

      {/* ── FORM CARD ─────────────────────────────────── */}
      <div
        className="rounded-[var(--radius-lg)] border p-6"
        style={{
          background: "var(--color-bg-glass)",
          borderColor: "var(--color-border)",
          backdropFilter: "blur(24px)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Top edge highlight */}
        <div
          className="absolute inset-x-0 top-0 h-px rounded-t-[var(--radius-lg)] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(42,125,255,0.3), transparent)",
          }}
        />

        <h1
          className="text-[20px] font-bold mb-0.5 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Connexion
        </h1>
        <p
          className="text-[13px] mb-5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Accède à ton compte
        </p>

        {/* Wrappé dans Suspense — requis par Next.js App Router */}
        <Suspense
          fallback={<div className="h-40 shimmer rounded-[var(--radius-sm)]" />}
        >
          <LoginForm />
        </Suspense>

        {/* Séparateur */}
        <div className="flex items-center gap-3 my-4">
          <div
            className="flex-1 h-px"
            style={{ background: "var(--color-border)" }}
          />
          <span
            className="text-[11px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            ou
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "var(--color-border)" }}
          />
        </div>

        {/* Démo (sans compte) */}
        <Link
          href="/game"
          className="flex w-full items-center justify-center gap-2 h-9 rounded-[var(--radius-sm)] border text-[13px] font-medium transition-all duration-150 hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-secondary)",
            background: "transparent",
          }}
        >
          Voir la démo sans compte
        </Link>
      </div>

      {/* Lien inscription */}
      <p
        className="text-center text-[12px] mt-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        Pas encore de compte ?{" "}
        <Link
          href="/signup"
          className="font-medium transition-colors duration-150 hover:text-[var(--color-brand-hi)]"
          style={{ color: "var(--color-brand)" }}
        >
          S&apos;inscrire gratuitement
        </Link>
      </p>
    </div>
  );
}
