'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Swords, Users, Plus, ArrowLeft, Clock, Trophy } from 'lucide-react'
import { PACKS } from '@/data/packs'
import { useBalance } from '@/hooks/useGame'

interface MockBattle {
  id: string
  packId: string
  packName: string
  emoji: string
  stake: number
  players: { name: string; initial: string; ready: boolean }[]
  maxPlayers: number
  status: 'waiting' | 'in-progress'
  createdMin: number
}

const MOCK_BATTLES: MockBattle[] = [
  {
    id: 'b1',
    packId: 'mewtwo',
    packName: 'La Caisse Méwtwo',
    emoji: '🧠',
    stake: 2.0,
    players: [{ name: 'PsyMaster', initial: 'P', ready: true }],
    maxPlayers: 2,
    status: 'waiting',
    createdMin: 1,
  },
  {
    id: 'b2',
    packId: 'vmax',
    packName: 'La Caisse VMAX Secrets',
    emoji: '🌈',
    stake: 5.0,
    players: [
      { name: 'RainbowKing', initial: 'R', ready: true },
      { name: 'VmaxHunter', initial: 'V', ready: false },
    ],
    maxPlayers: 4,
    status: 'waiting',
    createdMin: 3,
  },
  {
    id: 'b3',
    packId: 'charizard',
    packName: 'La Caisse Dracolosse',
    emoji: '🔥',
    stake: 50,
    players: [
      { name: 'FlameLord', initial: 'F', ready: true },
      { name: 'DraGoat', initial: 'D', ready: true },
    ],
    maxPlayers: 2,
    status: 'in-progress',
    createdMin: 0,
  },
  {
    id: 'b4',
    packId: 'tagteam',
    packName: 'La Caisse Tag Team',
    emoji: '⚡',
    stake: 4.0,
    players: [{ name: 'DuoFan', initial: 'D', ready: true }],
    maxPlayers: 3,
    status: 'waiting',
    createdMin: 5,
  },
  {
    id: 'b5',
    packId: 'shinings',
    packName: 'La Caisse Shinings',
    emoji: '✨',
    stake: 10,
    players: [
      { name: 'NeoCollector', initial: 'N', ready: true },
      { name: 'ShinyHunter', initial: 'S', ready: true },
      { name: 'OldSchool99', initial: 'O', ready: false },
    ],
    maxPlayers: 4,
    status: 'waiting',
    createdMin: 2,
  },
  {
    id: 'b6',
    packId: 'crystal',
    packName: 'La Caisse Cristal',
    emoji: '💎',
    stake: 15,
    players: [{ name: 'AquapolisFan', initial: 'A', ready: true }],
    maxPlayers: 2,
    status: 'waiting',
    createdMin: 7,
  },
]

export default function BattlePage() {
  const { balance } = useBalance()
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="min-h-full page-enter" style={{ position: 'relative', zIndex: 1 }}>
      <div className="px-4 sm:px-6 md:px-8 pt-6 pb-16 mx-auto" style={{ maxWidth: 1280 }}>

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
              <Swords size={14} style={{ color: 'var(--color-negative)' }} />
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.4px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Battle PvP · La carte la plus chère gagne
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
              Battles en cours
            </h1>
            <p className="text-[13px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Affronte d&apos;autres joueurs en simultané. Le winner prend tout.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-11 px-4 rounded-[var(--radius-sm)] font-bold text-[13px] text-white transition-all hover:scale-[1.02]"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, var(--color-negative), #FF4D5E)',
              boxShadow: '0 0 24px rgba(255,77,94,0.4)',
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Créer
          </button>
        </div>

        {/* Mock notice */}
        <div
          className="rounded-[var(--radius-sm)] border px-4 py-2.5 mb-6 text-[11.5px]"
          style={{
            background: 'var(--color-bg-glass)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          ⚠️ Mode démo — les battles temps réel arrivent avec Supabase Realtime.
        </div>

        {/* Battle list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_BATTLES.map(b => (
            <BattleCard key={b.id} battle={b} canJoin={balance >= b.stake} />
          ))}
        </div>

        {/* Create modal (basic stub) */}
        {showCreate && (
          <CreateBattleModal onClose={() => setShowCreate(false)} />
        )}
      </div>
    </div>
  )
}

function BattleCard({ battle, canJoin }: { battle: MockBattle; canJoin: boolean }) {
  const slotsLeft = battle.maxPlayers - battle.players.length
  const totalPot = battle.stake * battle.maxPlayers

  return (
    <div
      className="rounded-[var(--radius-md)] border p-4 transition-all hover:scale-[1.01]"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor:
          battle.status === 'in-progress'
            ? 'rgba(255,77,94,0.3)'
            : 'var(--color-border-strong)',
        boxShadow:
          battle.status === 'in-progress'
            ? '0 0 24px rgba(255,77,94,0.2)'
            : 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center text-[20px]"
            style={{ background: 'var(--color-bg-glass-hi)' }}
          >
            {battle.emoji}
          </div>
          <div>
            <p
              className="text-[13px] font-bold leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
              }}
            >
              {battle.packName}
            </p>
            <p
              className="text-[10.5px] flex items-center gap-1 mt-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Clock size={9} />
              {battle.status === 'in-progress'
                ? 'En cours'
                : `Créé il y a ${battle.createdMin} min`}
            </p>
          </div>
        </div>
        <span
          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[1px]"
          style={{
            background:
              battle.status === 'in-progress'
                ? 'var(--color-negative-soft)'
                : 'var(--color-positive-soft)',
            color:
              battle.status === 'in-progress'
                ? 'var(--color-negative)'
                : 'var(--color-positive)',
          }}
        >
          {battle.status === 'in-progress' ? 'LIVE' : 'OPEN'}
        </span>
      </div>

      {/* Players */}
      <div className="flex items-center gap-1.5 mb-3">
        {battle.players.map((p, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{
              background:
                'linear-gradient(135deg, var(--color-brand), var(--color-cyan))',
              border: p.ready ? '2px solid var(--color-positive)' : '2px solid var(--color-border-strong)',
            }}
          >
            {p.initial}
          </div>
        ))}
        {Array.from({ length: slotsLeft }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-7 h-7 rounded-full flex items-center justify-center border border-dashed"
            style={{
              borderColor: 'var(--color-border-strong)',
              color: 'var(--color-text-subtle)',
            }}
          >
            <Users size={10} />
          </div>
        ))}
        <span
          className="ml-auto text-[10px] font-mono"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {battle.players.length}/{battle.maxPlayers}
        </span>
      </div>

      {/* Stake + action */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <p
            className="text-[9px] font-semibold uppercase tracking-[1.2px]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Pot
          </p>
          <p
            className="text-[16px] font-extrabold tabular-nums"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-pokemon-yellow)',
            }}
          >
            ${totalPot.toFixed(2)}
          </p>
        </div>
        <button
          disabled={!canJoin || battle.status === 'in-progress'}
          className="h-9 px-4 rounded-[var(--radius-sm)] font-bold text-[12px] text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
          style={{
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(135deg, var(--color-negative), #FF4D5E)',
            boxShadow: !canJoin || battle.status === 'in-progress' ? 'none' : '0 0 12px rgba(255,77,94,0.4)',
          }}
        >
          {battle.status === 'in-progress'
            ? 'En cours'
            : !canJoin
              ? 'Solde insuf.'
              : `Rejoindre · $${battle.stake.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}

function CreateBattleModal({ onClose }: { onClose: () => void }) {
  const [selectedPack, setSelectedPack] = useState(PACKS[0].id)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="max-w-md w-full rounded-[var(--radius-lg)] border p-6"
        style={{
          background: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-strong)',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2
          className="text-[20px] font-bold mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          Créer une battle
        </h2>
        <p className="text-[12px] mb-5" style={{ color: 'var(--color-text-secondary)' }}>
          Choisis la caisse, fixe la mise, attends les joueurs.
        </p>

        <label className="block mb-1 text-[10px] font-semibold uppercase tracking-[1.2px]" style={{ color: 'var(--color-text-muted)' }}>
          Caisse
        </label>
        <select
          value={selectedPack}
          onChange={e => setSelectedPack(e.target.value)}
          className="w-full h-10 px-3 rounded-[var(--radius-sm)] border text-[13px] mb-4"
          style={{
            background: 'var(--color-bg-glass)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          {PACKS.map(p => (
            <option key={p.id} value={p.id}>
              {p.nameFr} — ${p.price.toFixed(2)}
            </option>
          ))}
        </select>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-[var(--radius-sm)] border text-[13px] font-medium"
            style={{
              borderColor: 'var(--color-border-strong)',
              background: 'var(--color-bg-glass)',
              color: 'var(--color-text-primary)',
            }}
          >
            Annuler
          </button>
          <button
            disabled
            className="flex-1 h-10 rounded-[var(--radius-sm)] font-bold text-[13px] text-white opacity-60"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, var(--color-negative), #FF4D5E)',
            }}
            title="Disponible avec Supabase Realtime"
          >
            <Trophy size={13} className="inline mr-1" />
            Bientôt dispo
          </button>
        </div>
      </div>
    </div>
  )
}
