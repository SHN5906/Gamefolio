'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft, Check } from 'lucide-react'

const schema = z.object({ email: z.string().email('Email invalide') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createClient()
      await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white font-bold text-base flex-shrink-0"
          style={{ fontFamily: 'var(--font-display)', background: 'linear-gradient(140deg, var(--color-brand), #4F46E5)', boxShadow: '0 0 28px var(--color-brand-glow)' }}
        >
          CF
        </div>
      </div>

      <div
        className="rounded-[var(--radius-lg)] border p-6"
        style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', backdropFilter: 'blur(24px)' }}
      >
        {sent ? (
          <div className="flex flex-col items-center py-4 gap-3">
            <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-positive-soft)' }}>
              <Check size={18} style={{ color: 'var(--color-positive)' }} strokeWidth={2.5} />
            </span>
            <p className="text-base font-semibold text-center" style={{ fontFamily: 'var(--font-display)' }}>Email envoyé</p>
            <p className="text-[12px] text-center" style={{ color: 'var(--color-text-muted)' }}>
              Vérifie ta boîte mail pour réinitialiser ton mot de passe.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-[20px] font-bold mb-0.5 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Mot de passe oublié
            </h1>
            <p className="text-[13px] mb-5" style={{ color: 'var(--color-text-muted)' }}>
              On t&apos;envoie un lien de réinitialisation.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
              <Input label="Email" type="email" placeholder="hugo@exemple.fr" icon={<Mail size={14} />} error={errors.email?.message} {...register('email')} />
              <Button type="submit" loading={loading} className="w-full justify-center">
                Envoyer le lien
              </Button>
            </form>
          </>
        )}
      </div>

      <div className="flex justify-center mt-4">
        <Link href="/login" className="flex items-center gap-1.5 text-[12px] transition-colors" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={12} />
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
