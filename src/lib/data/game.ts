// Persistance locale (LocalStorage) — sera remplacée par Supabase plus tard
// Pour l'instant, mode démo : tout est stocké côté client.

import type { GameCard, OpeningResult } from '@/types/game'
import { STARTING_BALANCE, FREE_DAILY_LIMIT } from '@/data/packs'

const KEY_BALANCE = 'gf:balance'
const KEY_DAILY = 'gf:daily'
const KEY_INVENTORY = 'gf:inventory'
const KEY_BOOTSTRAPPED = 'gf:bootstrapped'
const KEY_COOLDOWN = 'gf:cooldown-until'

// Cooldown de 2h quand solde = 0, puis on offre $5 pour rejouer
export const COOLDOWN_MS = 2 * 60 * 60 * 1000  // 2 heures
export const REFRESH_AMOUNT = 5.00

interface DailyState {
  used: number
  date: string // YYYY-MM-DD
}

interface InventoryEntry {
  card: GameCard
  count: number
  firstAcquiredAt: string
}

// ── Bootstrap : si nouveau joueur, créditer $10 ────────────────────────
export function bootstrapIfNeeded(): { balance: number; bootstrapped: boolean } {
  if (typeof window === 'undefined') return { balance: STARTING_BALANCE, bootstrapped: false }
  const already = localStorage.getItem(KEY_BOOTSTRAPPED)
  if (already === '1') {
    return { balance: getBalance(), bootstrapped: false }
  }
  localStorage.setItem(KEY_BALANCE, String(STARTING_BALANCE))
  localStorage.setItem(KEY_BOOTSTRAPPED, '1')
  return { balance: STARTING_BALANCE, bootstrapped: true }
}

// ── Balance ─────────────────────────────────────────────────────────────
export function getBalance(): number {
  if (typeof window === 'undefined') return STARTING_BALANCE
  const v = localStorage.getItem(KEY_BALANCE)
  if (v === null) return STARTING_BALANCE
  const n = parseFloat(v)
  return isNaN(n) ? STARTING_BALANCE : n
}

export function setBalance(amount: number): void {
  if (typeof window === 'undefined') return
  // Clamp à 0 minimum — jamais de solde négatif
  const clamped = Math.max(0, parseFloat(amount.toFixed(2)))
  localStorage.setItem(KEY_BALANCE, clamped.toFixed(2))
  window.dispatchEvent(new CustomEvent('gf:balance-changed', { detail: clamped }))
  // Si on tombe à 0, démarrer le cooldown
  if (clamped === 0 && getCooldownUntil() === null) {
    startCooldown()
  }
}

export function addBalance(delta: number): number {
  const next = parseFloat((getBalance() + delta).toFixed(2))
  setBalance(next)
  return getBalance()
}

// ── Cooldown ──────────────────────────────────────────────────────────
export function getCooldownUntil(): number | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(KEY_COOLDOWN)
  if (!v) return null
  const ts = parseInt(v, 10)
  if (isNaN(ts) || ts <= Date.now()) return null
  return ts
}

export function startCooldown(): number {
  const until = Date.now() + COOLDOWN_MS
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_COOLDOWN, String(until))
    window.dispatchEvent(new CustomEvent('gf:cooldown-changed'))
  }
  return until
}

export function clearCooldown(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY_COOLDOWN)
  window.dispatchEvent(new CustomEvent('gf:cooldown-changed'))
}

export function isCooldownActive(): boolean {
  return getCooldownUntil() !== null
}

/**
 * Réclame le refresh post-cooldown : ajoute $REFRESH_AMOUNT et clear le cooldown.
 * Le cooldown doit avoir expiré (timestamp passé). On distingue "pas de cooldown
 * du tout" (n'a jamais joué jusqu'à $0) de "cooldown expiré, prêt à claim" via
 * la présence brute de la clé localStorage.
 */
export function claimRefresh(): { success: boolean; amount: number } {
  if (typeof window === 'undefined') return { success: false, amount: 0 }
  // getCooldownUntil() retourne null si expiré OU si absent.
  // On utilise la présence brute de la clé pour distinguer les deux cas.
  const raw = localStorage.getItem(KEY_COOLDOWN)
  if (!raw) return { success: false, amount: 0 }
  const ts = parseInt(raw, 10)
  if (isNaN(ts) || ts > Date.now()) return { success: false, amount: 0 }
  clearCooldown()
  addBalance(REFRESH_AMOUNT)
  return { success: true, amount: REFRESH_AMOUNT }
}

// ── Daily Openings ──────────────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function emptyDailyState(): DailyState {
  return { used: 0, date: todayStr() }
}

export function getDailyState(): DailyState {
  if (typeof window === 'undefined') return emptyDailyState()
  const raw = localStorage.getItem(KEY_DAILY)
  if (!raw) return emptyDailyState()
  try {
    const parsed = JSON.parse(raw) as DailyState
    return parsed.date === todayStr() ? parsed : emptyDailyState()
  } catch {
    return emptyDailyState()
  }
}

export function getDailyUsed(): number {
  return getDailyState().used
}

export function getDailyRemaining(): number {
  return Math.max(0, FREE_DAILY_LIMIT - getDailyUsed())
}

export function incrementDailyUsed(): number {
  const state = getDailyState()
  state.used += 1
  state.date = todayStr()
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_DAILY, JSON.stringify(state))
    window.dispatchEvent(new CustomEvent('gf:daily-changed', { detail: state }))
  }
  return state.used
}

// ── Inventory (cartes possédées) ────────────────────────────────────────
export function getInventory(): InventoryEntry[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(KEY_INVENTORY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as InventoryEntry[]
  } catch {
    return []
  }
}

export function addToInventory(card: GameCard): { isNew: boolean; entry: InventoryEntry } {
  const inv = getInventory()
  const existing = inv.find(e => e.card.id === card.id)
  let isNew = false
  let entry: InventoryEntry
  if (existing) {
    existing.count += 1
    entry = existing
  } else {
    entry = { card, count: 1, firstAcquiredAt: new Date().toISOString() }
    inv.push(entry)
    isNew = true
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_INVENTORY, JSON.stringify(inv))
    window.dispatchEvent(new CustomEvent('gf:inventory-changed'))
  }
  return { isNew, entry }
}

export function removeFromInventory(cardId: string, qty = 1): boolean {
  const inv = getInventory()
  const entry = inv.find(e => e.card.id === cardId)
  if (!entry || entry.count < qty) return false
  entry.count -= qty
  const filtered = inv.filter(e => e.count > 0)
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_INVENTORY, JSON.stringify(filtered))
    window.dispatchEvent(new CustomEvent('gf:inventory-changed'))
  }
  return true
}

export function getInventoryValue(): number {
  return getInventory().reduce((sum, e) => sum + e.card.value * e.count, 0)
}

// ── Opening — orchestration complète ────────────────────────────────────
export function recordOpening(packId: string, card: GameCard): OpeningResult {
  const { isNew } = addToInventory(card)
  return {
    card,
    isNew,
    packId,
    openedAt: new Date().toISOString(),
  }
}

// ── Vente de cartes ─────────────────────────────────────────────────────
/** Revend 1 ou N exemplaires d'une carte. Crédite le solde à 100% de la valeur marché. */
export function sellCard(cardId: string, qty = 1): { success: boolean; valueGained: number } {
  const inv = getInventory()
  const entry = inv.find(e => e.card.id === cardId)
  if (!entry || entry.count < qty) return { success: false, valueGained: 0 }

  const valueGained = parseFloat((entry.card.value * qty).toFixed(2))
  removeFromInventory(cardId, qty)
  addBalance(valueGained)
  // Si on était en cooldown, le clear (la vente débloque)
  clearCooldown()
  return { success: true, valueGained }
}

/** Revend toutes les cartes (vide l'inventaire). */
export function sellAllCards(): { totalGained: number; cardsSold: number } {
  const inv = getInventory()
  let total = 0
  let count = 0
  for (const entry of inv) {
    total += entry.card.value * entry.count
    count += entry.count
  }
  total = parseFloat(total.toFixed(2))
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_INVENTORY, '[]')
    window.dispatchEvent(new CustomEvent('gf:inventory-changed'))
  }
  if (total > 0) {
    addBalance(total)
    clearCooldown()
  }
  return { totalGained: total, cardsSold: count }
}

// ── Profil utilisateur (localStorage, sans Supabase) ─────────────────────
const KEY_PROFILE = 'gf:profile'

export interface UserProfile {
  username: string
  avatarColor: string
  createdAt: string
}

const DEFAULT_USERNAMES = ['Dresseur Pro', 'Maître du Centre', 'Champion Élite', 'Apprenti TCG', 'Collectionneur', 'Chasseur Holo']
const AVATAR_COLORS = [
  '#2A7DFF', '#10D9A0', '#FFCC00', '#EC4899', '#8B5CF6',
  '#FF6B47', '#00D4FF', '#F8A5C2',
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return { username: 'Dresseur', avatarColor: '#2A7DFF', createdAt: new Date().toISOString() }
  }
  const raw = localStorage.getItem(KEY_PROFILE)
  if (!raw) {
    const fresh: UserProfile = {
      username: randomFrom(DEFAULT_USERNAMES),
      avatarColor: randomFrom(AVATAR_COLORS),
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(KEY_PROFILE, JSON.stringify(fresh))
    return fresh
  }
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    const fresh: UserProfile = {
      username: randomFrom(DEFAULT_USERNAMES),
      avatarColor: randomFrom(AVATAR_COLORS),
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(KEY_PROFILE, JSON.stringify(fresh))
    return fresh
  }
}

export function setProfile(patch: Partial<UserProfile>): UserProfile {
  const current = getProfile()
  const next: UserProfile = { ...current, ...patch }
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_PROFILE, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('gf:profile-changed', { detail: next }))
  }
  return next
}

/** Reset complet : efface tout, recrée un compte vierge avec $10 de bonus. */
export function resetAccount(): void {
  if (typeof window === 'undefined') return
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith('gf:')) localStorage.removeItem(k)
  })
  bootstrapIfNeeded()
  window.dispatchEvent(new CustomEvent('gf:balance-changed', { detail: getBalance() }))
  window.dispatchEvent(new CustomEvent('gf:inventory-changed'))
  window.dispatchEvent(new CustomEvent('gf:profile-changed'))
}
