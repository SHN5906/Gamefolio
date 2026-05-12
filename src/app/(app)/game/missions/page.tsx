'use client'

import Link from 'next/link'
import { ArrowLeft, Gift, Calendar, CheckCircle2, Clock } from 'lucide-react'
import type { Mission } from '@/types/game'
import { useBalance } from '@/hooks/useGame'
import { useState } from 'react'

const DAILY_MISSIONS: Mission[] = [
  { id: 'd1', title: 'Connexion quotidienne', description: 'Connecte-toi aujourd\'hui',     reward: 0.10, type: 'daily', progress: 1, goal: 1, completed: true,  icon: '☀️' },
  { id: 'd2', title: 'Ouvre 5 caisses gratuites',  description: 'Utilise tes ouvertures du jour', reward: 0.20, type: 'daily', progress: 3, goal: 5, completed: false, icon: '🎴' },
  { id: 'd3', title: 'Gagne une carte holo',       description: 'Obtiens une carte rare ou +', reward: 0.30, type: 'daily', progress: 0, goal: 1, completed: false, icon: '✨' },
  { id: 'd4', title: 'Visite le jackpot',          description: 'Va voir le pot du jour',     reward: 0.05, type: 'daily', progress: 0, goal: 1, completed: false, icon: '👀' },
  { id: 'd5', title: 'Joue une battle',            description: 'Rejoins ou crée une battle', reward: 0.50, type: 'daily', progress: 0, goal: 1, completed: false, icon: '⚔️' },
]

const WEEKLY_MISSIONS: Mission[] = [
  { id: 'w1', title: 'Streak 7 jours',         description: 'Connecte-toi 7 jours d\'affilée',   reward: 1.00, type: 'weekly', progress: 3, goal: 7, completed: false, icon: '🔥' },
  { id: 'w2', title: 'Ouvre 100 caisses',      description: '100 ouvertures cette semaine',       reward: 2.50, type: 'weekly', progress: 28, goal: 100, completed: false, icon: '📦' },
  { id: 'w3', title: 'Collection de $50',      description: 'Atteins $50 de valeur en cartes',    reward: 5.00, type: 'weekly', progress: 12, goal: 50, completed: false, icon: '💼' },
  { id: 'w4', title: 'Gagne 3 battles',        description: 'Remporte 3 PvP cette semaine',       reward: 3.00, type: 'weekly', progress: 0, goal: 3, completed: false, icon: '🏆' },
]

export default function MissionsPage() {
  const { balance } = useBalance()
  const [claimed, setClaimed] = useState<Set<string>>(new Set())

  const allMissions = [...DAILY_MISSIONS, ...WEEKLY_MISSIONS]
  const totalEarnable = allMissions
    .filter(m => !claimed.has(m.id))
    .reduce((s, m) => s + m.reward, 0)

  return (
    <div className="min-h-full page-enter" style={{ position: 'relative', zIndex: 1 }}>
      <div className="px-4 sm:px-6 md:px-8 pt-6 pb-16 mx-auto" style={{ maxWidth: 1100 }}>
        <Link
          href="/game"
          className="flex items-center gap-2 text-[12px] font-medium mb-5 transition-colors hover:text-[var(--color-text-primary)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft size={13} />
          Retour
        </Link>

        {/* Header */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gift size={14} style={{ color: 'var(--color-positive)' }} />
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.4px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Missions · Gagne des dollars gratuitement
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
              Tes missions
            </h1>
            <p className="text-[13px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              ${totalEarnable.toFixed(2)} à gagner cette semaine. Solde actuel : ${balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Daily */}
        <Section icon={<Calendar size={14} />} title="Missions du jour" subtitle="Reset à minuit">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DAILY_MISSIONS.map(m => (
              <MissionCard
                key={m.id}
                mission={m}
                claimed={claimed.has(m.id)}
                onClaim={() => setClaimed(c => new Set(c).add(m.id))}
              />
            ))}
          </div>
        </Section>

        {/* Weekly */}
        <Section icon={<Clock size={14} />} title="Missions de la semaine" subtitle="Plus difficiles, mieux récompensées">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WEEKLY_MISSIONS.map(m => (
              <MissionCard
                key={m.id}
                mission={m}
                claimed={claimed.has(m.id)}
                onClaim={() => setClaimed(c => new Set(c).add(m.id))}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div style={{ color: 'var(--color-text-muted)' }}>{icon}</div>
        <h2
          className="text-[16px] font-bold"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h2>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          · {subtitle}
        </span>
      </div>
      {children}
    </div>
  )
}

function MissionCard({
  mission,
  claimed,
  onClaim,
}: {
  mission: Mission
  claimed: boolean
  onClaim: () => void
}) {
  const pct = (mission.progress / mission.goal) * 100
  const ready = mission.progress >= mission.goal && !claimed

  return (
    <div
      className="rounded-[var(--radius-md)] border p-4 transition-all"
      style={{
        background: claimed
          ? 'rgba(16,217,160,0.04)'
          : ready
            ? 'linear-gradient(135deg, rgba(255,204,0,0.06), var(--color-bg-elevated))'
            : 'var(--color-bg-elevated)',
        borderColor: claimed
          ? 'rgba(16,217,160,0.25)'
          : ready
            ? 'rgba(255,204,0,0.3)'
            : 'var(--color-border)',
        boxShadow: ready ? '0 0 24px rgba(255,204,0,0.15)' : 'none',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center text-[20px] flex-shrink-0"
          style={{
            background: 'var(--color-bg-glass-hi)',
          }}
        >
          {mission.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-bold leading-tight"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-primary)',
            }}
          >
            {mission.title}
          </p>
          <p
            className="text-[11px] mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {mission.description}
          </p>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-[11px] font-extrabold tabular-nums"
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--color-positive-soft)',
            color: 'var(--color-positive)',
          }}
        >
          +${mission.reward.toFixed(2)}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 rounded-full overflow-hidden mb-2"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, pct)}%`,
            background: ready
              ? 'linear-gradient(90deg, var(--color-pokemon-yellow), #FFA500)'
              : 'linear-gradient(90deg, var(--color-brand), var(--color-cyan))',
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] tabular-nums"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
        >
          {mission.progress}/{mission.goal}
        </span>
        {claimed ? (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: 'var(--color-positive)' }}
          >
            <CheckCircle2 size={12} />
            Récolté
          </span>
        ) : ready ? (
          <button
            onClick={onClaim}
            className="px-3 h-7 rounded-[6px] text-[11px] font-bold text-black"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            }}
          >
            Récolter
          </button>
        ) : null}
      </div>
    </div>
  )
}
