'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CardArt } from '@/components/cards/CardArt'
import { User, Mail, Lock, ArrowRight, Check } from 'lucide-react'

const schema = z.object({
  name:     z.string().min(2, '2 caractères minimum'),
  email:    z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, '8 caractères minimum')
    .regex(/[A-Z]/, 'Une majuscule requise')
    .regex(/[0-9]/, 'Un chiffre requis'),
})
type FormData = z.infer<typeof schema>

const FEATURES = [
  'Valorisation Cardmarket en temps réel',
  'Courbes de prix historiques',
  'P&L par carte et par set',
  '50 cartes gratuites sans CB',
]

export default function SignupPage() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setAuthError(null)

    // Mode démo sans Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      router.push('/dashboard')
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email:    data.email,
      password: data.password,
      options: { data: { display_name: data.name } },
    })

    if (error) {
      setAuthError(error.message)
      setLoading(false)
      return
    }

    router.push('/login?confirm=1')
  }

  return (
    <div className="w-full max-w-[800px] grid gap-12" style={{ gridTemplateColumns: '1fr 1fr' }}>

      {/* ── GAUCHE : PITCH ────────────────────────────── */}
      <div className="flex flex-col justify-center">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-9 h-9 rounded-[9px] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(140deg, var(--color-brand), #4F46E5)',
              boxShadow: '0 0 24px var(--color-brand-glow)',
            }}
          >
            CF
          </div>
          <span className="text-[17px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            CardFolio
          </span>
        </div>

        <h2
          className="text-[28px] font-bold leading-tight tracking-tight mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Ta collection mérite mieux qu&apos;un Notion.
        </h2>
        <p className="text-[13px] mb-7" style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Rejoins les collectionneurs qui suivent leurs cartes comme un portefeuille financier.
        </p>

        {/* Features */}
        <div className="flex flex-col gap-2.5 mb-8">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-positive-soft)' }}
              >
                <Check size={9} style={{ color: 'var(--color-positive)' }} strokeWidth={3} />
              </span>
              <span className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Cartes déco */}
        <div className="flex gap-2 items-end">
          {(['dark', 'fire', 'water', 'lightning'] as const).map((e, i) => (
            <div
              key={e}
              className="transition-transform duration-300"
              style={{
                transform: `rotate(${[-8, -3, 4, 10][i]}deg) scale(${[0.8, 0.9, 0.85, 0.75][i]})`,
                opacity: [0.5, 0.75, 0.6, 0.4][i],
              }}
            >
              <CardArt energy={e} size="md" />
            </div>
          ))}
        </div>
      </div>

      {/* ── DROITE : FORM ─────────────────────────────── */}
      <div className="flex flex-col justify-center">
        <div
          className="rounded-[var(--radius-lg)] border p-6"
          style={{
            background: 'var(--color-bg-glass)',
            borderColor: 'var(--color-border)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <h1 className="text-[20px] font-bold mb-0.5 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Créer un compte
          </h1>
          <p className="text-[13px] mb-5" style={{ color: 'var(--color-text-muted)' }}>
            Gratuit · 50 cartes · Sans CB
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            <Input
              label="Prénom"
              placeholder="Hugo"
              autoComplete="given-name"
              icon={<User size={14} />}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="hugo@exemple.fr"
              autoComplete="email"
              icon={<Mail size={14} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              icon={<Lock size={14} />}
              error={errors.password?.message}
              {...register('password')}
            />

            {authError && (
              <p className="text-[12px]" style={{ color: 'var(--color-negative)' }}>
                {authError}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-1 justify-center">
              Créer mon compte
              {!loading && <ArrowRight size={14} />}
            </Button>
          </form>

          <p className="text-[11px] text-center mt-4" style={{ color: 'var(--color-text-muted)' }}>
            En créant un compte, tu acceptes nos{' '}
            <span className="underline cursor-pointer" style={{ color: 'var(--color-brand)' }}>
              CGU
            </span>
          </p>
        </div>

        <p className="text-center text-[12px] mt-4" style={{ color: 'var(--color-text-muted)' }}>
          Déjà un compte ?{' '}
          <Link href="/login" className="font-medium" style={{ color: 'var(--color-brand)' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
