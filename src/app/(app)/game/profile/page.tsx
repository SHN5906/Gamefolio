'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User, Edit3, Check, X, LogOut, RotateCcw,
  Trophy, Archive, DollarSign, Calendar, Palette,
} from 'lucide-react'
import { useProfile, useBalance, useInventory } from '@/hooks/useGame'

const AVATAR_COLORS = [
  '#2A7DFF', '#10D9A0', '#FFCC00', '#EC4899', '#8B5CF6',
  '#FF6B47', '#00D4FF', '#F8A5C2',
]

export default function ProfilePage() {
  const { profile, updateProfile, resetAccount } = useProfile()
  const { balance } = useBalance()
  const { count, totalValue } = useInventory()
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(profile.username)
  const [confirmReset, setConfirmReset] = useState(false)

  const initial = profile.username?.charAt(0).toUpperCase() ?? '?'
  const memberSince = new Date(profile.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const handleSaveName = () => {
    const trimmed = nameDraft.trim()
    if (trimmed && trimmed.length >= 2 && trimmed.length <= 24) {
      updateProfile({ username: trimmed })
      setEditingName(false)
    }
  }

  const handleResetClick = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    resetAccount()
  }

  return (
    <div className="min-h-full page-enter" style={{ position: 'relative', zIndex: 1 }}>
      <div className="px-4 sm:px-6 md:px-8 pt-6 pb-16 mx-auto" style={{ maxWidth: 800 }}>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <User size={14} style={{ color: 'var(--color-brand)' }} />
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.4px]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Mon profil
            </p>
          </div>
          <h1
            className="text-[28px] sm:text-[32px] font-extrabold tracking-tight leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.03em',
            }}
          >
            Mon compte
          </h1>
        </div>

        {/* Profile card */}
        <div
          className="rounded-[var(--radius-lg)] border p-5 sm:p-7 mb-5"
          style={{
            background:
              `linear-gradient(135deg, ${profile.avatarColor}11, var(--color-bg-elevated))`,
            borderColor: 'var(--color-border-strong)',
            boxShadow: `0 4px 32px ${profile.avatarColor}22`,
          }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex-shrink-0 flex items-center justify-center text-[32px] sm:text-[40px] font-extrabold text-white"
              style={{
                background: `linear-gradient(135deg, ${profile.avatarColor}, ${profile.avatarColor}AA)`,
                boxShadow: `0 0 32px ${profile.avatarColor}88`,
                fontFamily: 'var(--font-display)',
              }}
            >
              {initial}
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              {/* Username */}
              {editingName ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    maxLength={24}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName()
                      if (e.key === 'Escape') { setEditingName(false); setNameDraft(profile.username) }
                    }}
                    className="flex-1 h-10 px-3 rounded-[var(--radius-sm)] border text-[18px] font-bold outline-none"
                    style={{
                      background: 'var(--color-bg-glass-hi)',
                      borderColor: 'var(--color-brand)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-display)',
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center text-white"
                    style={{ background: 'var(--color-positive)' }}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameDraft(profile.username) }}
                    className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center border"
                    style={{
                      borderColor: 'var(--color-border-strong)',
                      background: 'var(--color-bg-glass)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                  <h2
                    className="text-[22px] sm:text-[26px] font-extrabold leading-tight"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: 'var(--color-text-primary)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {profile.username}
                  </h2>
                  <button
                    onClick={() => { setNameDraft(profile.username); setEditingName(true) }}
                    className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[var(--color-bg-glass-hi)]"
                    style={{ color: 'var(--color-text-muted)' }}
                    title="Changer de pseudo"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>
              )}

              <p
                className="text-[12px] flex items-center gap-1.5 justify-center sm:justify-start"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Calendar size={11} />
                Membre depuis le {memberSince}
              </p>
            </div>
          </div>

          {/* Color picker */}
          <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.2px] mb-3 flex items-center gap-1.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Palette size={11} />
              Couleur d&apos;avatar
            </p>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => updateProfile({ avatarColor: c })}
                  className="w-9 h-9 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: c,
                    border: profile.avatarColor === c
                      ? '3px solid #fff'
                      : '2px solid transparent',
                    boxShadow: profile.avatarColor === c ? `0 0 16px ${c}` : 'none',
                  }}
                  aria-label={`Couleur ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatTile
            icon={<DollarSign size={14} />}
            label="Solde"
            value={`$${balance.toFixed(2)}`}
            color="var(--color-positive)"
            bg="var(--color-positive-soft)"
          />
          <StatTile
            icon={<Archive size={14} />}
            label="Cartes"
            value={String(count)}
            color="var(--color-brand)"
            bg="var(--color-brand-soft)"
          />
          <StatTile
            icon={<Trophy size={14} />}
            label="Valeur"
            value={`$${totalValue.toFixed(2)}`}
            color="var(--color-pokemon-yellow)"
            bg="var(--color-pokemon-yellow-soft)"
          />
        </div>

        {/* Actions */}
        <div
          className="rounded-[var(--radius-md)] border overflow-hidden mb-3"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-strong)',
          }}
        >
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3.5 border-b transition-colors hover:bg-[var(--color-bg-glass-hi)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <div
              className="w-8 h-8 rounded-[6px] flex items-center justify-center"
              style={{ background: 'var(--color-brand-soft)', color: 'var(--color-brand)' }}
            >
              <User size={14} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold">Connexion / Créer un compte</p>
              <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Synchronise ton inventaire entre appareils
              </p>
            </div>
            <span style={{ color: 'var(--color-text-muted)' }}>→</span>
          </Link>

          <Link
            href="/game"
            className="flex items-center gap-3 px-4 py-3.5 border-b transition-colors hover:bg-[var(--color-bg-glass-hi)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <div
              className="w-8 h-8 rounded-[6px] flex items-center justify-center"
              style={{ background: 'var(--color-bg-glass-hi)', color: 'var(--color-text-secondary)' }}
            >
              <LogOut size={14} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold">Quitter le jeu</p>
              <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Retour au hub principal
              </p>
            </div>
            <span style={{ color: 'var(--color-text-muted)' }}>→</span>
          </Link>

          <button
            onClick={handleResetClick}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[rgba(255,77,94,0.08)]"
            style={{
              color: confirmReset ? 'var(--color-negative)' : 'var(--color-text-primary)',
              textAlign: 'left',
            }}
          >
            <div
              className="w-8 h-8 rounded-[6px] flex items-center justify-center"
              style={{ background: 'var(--color-negative-soft)', color: 'var(--color-negative)' }}
            >
              <RotateCcw size={14} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold">
                {confirmReset ? 'Cliquer à nouveau pour confirmer' : 'Réinitialiser le compte'}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Efface tout (solde, cartes, profil) et repart à $10
              </p>
            </div>
          </button>
        </div>

        <p
          className="text-[10.5px] text-center mt-4"
          style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-mono)' }}
        >
          Données stockées localement (LocalStorage) · Aucun serveur impliqué
        </p>
      </div>
    </div>
  )
}

function StatTile({
  icon, label, value, color, bg,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  bg: string
}) {
  return (
    <div
      className="rounded-[var(--radius-md)] border p-3"
      style={{
        background: 'var(--color-bg-glass)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div
        className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center mb-2"
        style={{ background: bg, color }}
      >
        {icon}
      </div>
      <p
        className="text-[9px] font-semibold uppercase tracking-[1.2px]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </p>
      <p
        className="text-[15px] font-bold tabular-nums leading-tight mt-0.5"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text-primary)',
        }}
      >
        {value}
      </p>
    </div>
  )
}
