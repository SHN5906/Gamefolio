'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Mail, Lock, Globe2, CreditCard, LogOut, Database, AlertCircle, Check,
  Loader2, Crown, Eye, Bell,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { fetchMyProfile, updateMyProfile, updateMyEmail, updateMyPassword, type ProfileRow } from '@/lib/data/profile'
import { logoutAction } from '@/lib/auth'
import { env } from '@/constants/env'

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile]       = useState<ProfileRow | null>(null)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [savedMsg, setSavedMsg]     = useState<string | null>(null)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername]       = useState('')
  const [avatarUrl, setAvatarUrl]     = useState<string | null>(null)
  const [email, setEmail]             = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [currency, setCurrency]       = useState<'EUR' | 'USD' | 'GBP'>('EUR')

  useEffect(() => {
    if (env.isDemoMode) {
      // Mode démo : profil bidon
      const demo: ProfileRow = {
        id: 'demo', email: 'hugo@example.com', username: 'hugo_marceau',
        display_name: 'Hugo Marceau', avatar_url: null,
        default_currency: 'EUR', default_language: 'fr',
        subscription_tier: 'pro', subscription_renews_at: '2026-12-31',
        created_at: '2025-01-15',
      }
      setProfile(demo)
      setDisplayName(demo.display_name ?? '')
      setUsername(demo.username ?? '')
      setEmail(demo.email ?? '')
      setLoading(false)
      return
    }
    fetchMyProfile().then(p => {
      if (p) {
        setProfile(p)
        setDisplayName(p.display_name ?? '')
        setUsername(p.username ?? '')
        setAvatarUrl(p.avatar_url)
        setEmail(p.email ?? '')
        setCurrency(p.default_currency)
      }
      setLoading(false)
    })
  }, [])

  async function handleSaveProfile() {
    setSaving(true); setErrorMsg(null); setSavedMsg(null)
    try {
      if (env.isDemoMode) { await new Promise(r => setTimeout(r, 400)); setSavedMsg('Profil mis à jour (démo)'); return }
      const res = await updateMyProfile({
        display_name: displayName,
        username: username || undefined,
        avatar_url: avatarUrl,
        default_currency: currency,
      })
      if (!res.ok) setErrorMsg(res.error)
      else setSavedMsg('Profil mis à jour')
    } finally { setSaving(false) }
  }

  async function handleSaveEmail() {
    if (!email || email === profile?.email) return
    setSaving(true); setErrorMsg(null); setSavedMsg(null)
    try {
      if (env.isDemoMode) { await new Promise(r => setTimeout(r, 400)); setSavedMsg('Email mis à jour (démo)'); return }
      const res = await updateMyEmail(email)
      if (!res.ok) setErrorMsg(res.error)
      else setSavedMsg(res.message ?? 'Email mis à jour')
    } finally { setSaving(false) }
  }

  async function handleSavePassword() {
    if (newPassword.length < 8) { setErrorMsg('Le mot de passe doit faire au moins 8 caractères.'); return }
    setSaving(true); setErrorMsg(null); setSavedMsg(null)
    try {
      if (env.isDemoMode) { await new Promise(r => setTimeout(r, 400)); setSavedMsg('Mot de passe changé (démo)'); setNewPassword(''); return }
      const res = await updateMyPassword(newPassword)
      if (!res.ok) setErrorMsg(res.error)
      else { setSavedMsg('Mot de passe mis à jour'); setNewPassword('') }
    } finally { setSaving(false) }
  }

  async function handleLogout() {
    if (env.isDemoMode) { router.push('/login'); return }
    await logoutAction()
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-8 pt-12 mx-auto" style={{ maxWidth: 800 }}>
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-brand)' }} />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 md:px-8 pt-6 md:pt-7 pb-12 mx-auto" style={{ maxWidth: 800 }}>
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-semibold uppercase tracking-[1.3px]" style={{ color: 'var(--color-text-muted)' }}>
            Compte
          </p>
          {env.isDemoMode && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
              style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)', border: '1px solid rgba(245,166,35,0.25)' }}>
              <Database size={9} /> Mode démo
            </span>
          )}
        </div>
        <h1 className="text-[28px] font-bold tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
          Paramètres
        </h1>
        <p className="text-[12px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          Gère ton profil, sécurité et préférences
        </p>
      </div>

      {/* Status messages */}
      {savedMsg && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] mb-4 text-[12px]" style={{ background: 'var(--color-positive-soft)', color: 'var(--color-positive)', border: '1px solid rgba(16,217,160,0.25)' }}>
          <Check size={13} strokeWidth={2.5} />{savedMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] mb-4 text-[12px]" style={{ background: 'var(--color-negative-soft)', color: 'var(--color-negative)', border: '1px solid rgba(255,77,94,0.25)' }}>
          <AlertCircle size={13} />{errorMsg}
        </div>
      )}

      {/* Subscription card */}
      <Card className="p-5 mb-5" elevated>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--color-pokemon-yellow), var(--color-warning))' }}>
              <Crown size={18} color="white" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[1.2px]" style={{ color: 'var(--color-text-muted)' }}>
                Plan actuel
              </p>
              <p className="text-[15px] font-bold capitalize" style={{ fontFamily: 'var(--font-display)' }}>
                GameFolio {profile?.subscription_tier ?? 'Free'}
              </p>
              {profile?.subscription_renews_at && (
                <p className="text-[10.5px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                  Renouvellement le {new Date(profile.subscription_renews_at).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
          <Button>Gérer</Button>
        </div>
      </Card>

      {/* Profile section */}
      <Section icon={User} title="Profil public" subtitle="Ton pseudo et avatar — visibles dans les battles, jackpot et leaderboard">
        <div className="flex flex-col sm:flex-row gap-5">
          <ImageUpload
            value={avatarUrl}
            onChange={setAvatarUrl}
            bucket="avatars"
            aspectRatio="square"
            maxSizeMB={2}
            label="Avatar"
          />
          <div className="flex-1 flex flex-col gap-3">
            <Input label="Nom affiché" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Dresseur Pro" />
            <Input label="Username (URL publique)" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} placeholder="dresseur_pro" />
            {username && (
              <p className="text-[10.5px]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                gamefolio.app/u/{username}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleSaveProfile} loading={saving}>Enregistrer</Button>
        </div>
      </Section>

      {/* Email */}
      <Section icon={Mail} title="Email" subtitle="Utilisé pour les notifications et la connexion">
        <div className="flex gap-3">
          <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="ton@email.com" />
          <Button onClick={handleSaveEmail} loading={saving} disabled={!email || email === profile?.email}>
            Mettre à jour
          </Button>
        </div>
      </Section>

      {/* Password */}
      <Section icon={Lock} title="Mot de passe">
        <div className="flex gap-3">
          <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe (8 caractères min)" />
          <Button onClick={handleSavePassword} loading={saving} disabled={newPassword.length < 8}>
            Changer
          </Button>
        </div>
      </Section>

      {/* Préférences (langue uniquement — la monnaie virtuelle est en $ fictif) */}
      <Section icon={Globe2} title="Langue de l'interface">
        <div className="flex flex-wrap gap-2">
          {(['EUR', 'USD'] as const).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className="h-8 px-3 rounded-[var(--radius-sm)] text-[12px] font-semibold border transition-all"
              style={{
                background: currency === c ? 'var(--color-brand)' : 'var(--color-bg-glass)',
                borderColor: currency === c ? 'var(--color-brand)' : 'var(--color-border)',
                color: currency === c ? 'white' : 'var(--color-text-secondary)',
                boxShadow: currency === c ? '0 0 12px var(--color-brand-glow)' : 'none',
              }}
            >
              {c === 'EUR' ? '🇫🇷 Français' : '🇺🇸 English (bientôt)'}
            </button>
          ))}
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications" subtitle="Reste informé sans spam">
        <ToggleRow label="Email quand un battle PvP que j'attends démarre" defaultOn />
        <ToggleRow label="Email quand le jackpot communautaire dépasse $1 000" />
        <ToggleRow label="Newsletter — nouvelles caisses & événements (1× / semaine max)" />
      </Section>

      {/* Confidentialité */}
      <Section icon={Eye} title="Confidentialité">
        <ToggleRow label="Profil public visible (battles, jackpot, leaderboard)" defaultOn />
        <ToggleRow label="Afficher ma valeur d'inventaire totale sur mon profil" />
        <ToggleRow label="Afficher mon historique d'ouvertures sur mon profil" />
      </Section>

      {/* Jeu responsable */}
      <Section icon={AlertCircle} title="Jeu responsable" subtitle="GameFolio est en monnaie fictive — mais si tu sens que tu joues trop, on est là">
        <ToggleRow label="Limiter mes ouvertures à 100/jour" />
        <ToggleRow label="Auto-exclusion 24h" />
        <ToggleRow label="Auto-exclusion 7 jours" />
        <p className="text-[11px] mt-3" style={{ color: 'var(--color-text-muted)' }}>
          Aide : <a href="https://www.joueurs-info-service.fr/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-brand)' }}>Joueurs Info Service — 09 74 75 13 13</a> (gratuit, 8h–2h)
        </p>
      </Section>

      {/* Danger zone */}
      <Section icon={LogOut} title="Compte" danger>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center justify-between h-10 px-4 rounded-[var(--radius-sm)] border text-[13px] font-medium transition-all hover:bg-[var(--color-bg-glass-hi)]"
            style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <span>Se déconnecter</span>
            <LogOut size={13} />
          </button>
          <button
            className="flex items-center justify-between h-10 px-4 rounded-[var(--radius-sm)] border text-[13px] font-medium transition-all"
            style={{ background: 'rgba(255,77,94,0.05)', borderColor: 'rgba(255,77,94,0.2)', color: 'var(--color-negative)' }}
          >
            <span>Supprimer mon compte</span>
            <span className="text-[10px] opacity-60">Définitif</span>
          </button>
        </div>
      </Section>
    </div>
  )
}

// ── Sub-components ──
function Section({
  icon: Icon, title, subtitle, danger, children,
}: {
  icon: React.ElementType
  title: string
  subtitle?: string
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <Card className="p-5 mb-4">
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center"
          style={{
            background: danger ? 'var(--color-negative-soft)' : 'var(--color-bg-glass-hi)',
            color: danger ? 'var(--color-negative)' : 'var(--color-text-secondary)',
          }}
        >
          <Icon size={13} strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-[13px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10.5px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </Card>
  )
}

function ToggleRow({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <button
        type="button"
        onClick={() => setOn(o => !o)}
        className="relative w-10 h-5 rounded-full transition-colors"
        style={{
          background: on ? 'var(--color-brand)' : 'var(--color-bg-glass-hi)',
          boxShadow: on ? 'inset 0 0 0 1px var(--color-brand-hi), 0 0 12px var(--color-brand-glow)' : 'inset 0 0 0 1px var(--color-border-strong)',
        }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: on ? 22 : 2, boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
        />
      </button>
    </div>
  )
}
