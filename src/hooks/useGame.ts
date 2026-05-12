'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  bootstrapIfNeeded,
  getBalance,
  setBalance as setBalanceStore,
  addBalance,
  getDailyUsed,
  incrementDailyUsed,
  getInventory,
  recordOpening,
  getCooldownUntil,
  claimRefresh as claimRefreshStore,
  REFRESH_AMOUNT,
  sellCard as sellCardStore,
  sellAllCards as sellAllCardsStore,
  getProfile,
  setProfile as setProfileStore,
  resetAccount as resetAccountStore,
  type UserProfile,
} from '@/lib/data/game'
import { FREE_DAILY_LIMIT } from '@/data/packs'
import type { GameCard, OpeningResult } from '@/types/game'

const isClient = typeof window !== 'undefined'

/**
 * Hook factory : s'abonne à un event custom et resync depuis un getter.
 * Lazy init pour éviter le flash SSR → CSR.
 */
function useStorageEvent<T>(eventName: string, read: () => T, fallback: T): T {
  const [state, setState] = useState<T>(() => (isClient ? read() : fallback))

  useEffect(() => {
    setState(read())
    const handler = () => setState(read())
    window.addEventListener(eventName, handler)
    return () => window.removeEventListener(eventName, handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName])

  return state
}

// ── Bootstrap ───────────────────────────────────────────────────────────
export function useBootstrap() {
  const [bootstrapped, setBootstrapped] = useState(false)
  useEffect(() => {
    setBootstrapped(bootstrapIfNeeded().bootstrapped)
  }, [])
  return bootstrapped
}

// ── Balance ─────────────────────────────────────────────────────────────
export function useBalance() {
  // Fallback sur getBalance() si l'event arrive sans detail valide
  const balance = useStorageEvent('gf:balance-changed', getBalance, 0)
  const update = useCallback((amount: number) => setBalanceStore(amount), [])
  const add = useCallback((delta: number) => addBalance(delta), [])
  return { balance, setBalance: update, addBalance: add }
}

// ── Daily Openings ──────────────────────────────────────────────────────
export function useDailyOpenings() {
  const used = useStorageEvent('gf:daily-changed', getDailyUsed, 0)
  const limit = FREE_DAILY_LIMIT
  const remaining = Math.max(0, limit - used)
  // Guard division par zéro
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const consume = useCallback(() => incrementDailyUsed(), [])
  return { used, limit, remaining, pct, consume }
}

// ── Inventory ───────────────────────────────────────────────────────────
export function useInventory() {
  const items = useStorageEvent('gf:inventory-changed', getInventory, [])
  // Dérivé : pas de re-parse du JSON, calcul direct depuis items
  const totalValue = items.reduce((s, e) => s + e.card.value * e.count, 0)
  const count = items.reduce((s, e) => s + e.count, 0)
  return { items, totalValue, count }
}

// ── Open Pack ───────────────────────────────────────────────────────────
export function useOpenPack() {
  return useCallback(
    (packId: string, card: GameCard, costPaid: number, wasFree: boolean): OpeningResult => {
      if (wasFree) {
        incrementDailyUsed()
      } else if (getBalance() >= costPaid) {
        addBalance(-costPaid)
      }
      return recordOpening(packId, card)
    },
    []
  )
}

// ── Cooldown ────────────────────────────────────────────────────────────
export function useCooldown() {
  const until = useStorageEvent('gf:cooldown-changed', getCooldownUntil, null)
  const [now, setNow] = useState<number>(() => Date.now())

  // Tick chaque seconde UNIQUEMENT si un cooldown est actif
  useEffect(() => {
    if (until === null) return
    setNow(Date.now())
    const tick = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(tick)
  }, [until])

  const active = until !== null && until > now
  const remainingMs = active && until ? until - now : 0
  const hours = Math.floor(remainingMs / 3600000)
  const minutes = Math.floor((remainingMs % 3600000) / 60000)
  const seconds = Math.floor((remainingMs % 60000) / 1000)

  const claim = useCallback(() => claimRefreshStore(), [])

  return {
    active,
    until,
    remainingMs,
    hours,
    minutes,
    seconds,
    label: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    canClaim: until !== null && until <= now,
    refreshAmount: REFRESH_AMOUNT,
    claim,
  }
}

// ── Sell ────────────────────────────────────────────────────────────────
export function useSellCard() {
  return useCallback((cardId: string, qty = 1) => sellCardStore(cardId, qty), [])
}

export function useSellAllCards() {
  return useCallback(() => sellAllCardsStore(), [])
}

// ── Profil ──────────────────────────────────────────────────────────────
const DEFAULT_PROFILE: UserProfile = {
  username: '',
  avatarColor: '#2A7DFF',
  createdAt: '',
}

export function useProfile() {
  const profile = useStorageEvent('gf:profile-changed', getProfile, DEFAULT_PROFILE)
  const update = useCallback((patch: Partial<UserProfile>) => setProfileStore(patch), [])
  const reset = useCallback(() => resetAccountStore(), [])
  return { profile, updateProfile: update, resetAccount: reset }
}
