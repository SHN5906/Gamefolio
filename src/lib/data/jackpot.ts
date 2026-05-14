// Jackpot communautaire — round commun où les joueurs déposent des cartes
// pour gagner le pot total (tirage pondéré par la valeur déposée).
//
// Round flow :
//   1. open      → on accepte des dépôts pendant ROUND_DURATION_MS
//   2. drawing   → animation de tirage (DRAWING_DURATION_MS)
//   3. closed    → winner désigné, archivé dans history, nouveau round démarre
//
// Persistence : localStorage uniquement (sera remplacé par Supabase realtime
// en Phase 2, cf. DEPLOY.md). Les bots déposent en local — leur "réalisme"
// est simulé via timers JS.

import type { InventoryItem } from "@/types/game";
import {
  getInventoryItems,
  removeInventoryItem,
  addInventoryItem,
  addBalance,
} from "./game";

// ── Constantes de tuning ────────────────────────────────────────────────
export const ROUND_DURATION_MS = 3 * 60 * 1000; // 3 minutes (démo)
export const DRAWING_DURATION_MS = 6 * 1000; // 6 sec d'animation
export const HOUSE_FEE = 0.05; // 5% prélevés sur le pot (cf. landing FAQ)
export const MIN_DEPOSIT_VALUE = 0.5; // minimum $ pour entrer

// ── Bots — alimentent le pot pour rendre la démo vivante ────────────────
interface Bot {
  userId: string;
  username: string;
  initial: string;
  color: string;
  /** Plage de valeur que le bot va déposer */
  depositRange: [number, number];
}

const BOTS: Bot[] = [
  {
    userId: "bot-liam",
    username: "LiamPro",
    initial: "L",
    color: "#5B7FFF",
    depositRange: [4, 16],
  },
  {
    userId: "bot-mew",
    username: "MewMaster",
    initial: "M",
    color: "#10D9A0",
    depositRange: [2, 10],
  },
  {
    userId: "bot-shiny",
    username: "ShinyKing",
    initial: "S",
    color: "#FFCC00",
    depositRange: [3, 12],
  },
  {
    userId: "bot-rainbow",
    username: "RainbowGod",
    initial: "R",
    color: "#EC4899",
    depositRange: [5, 20],
  },
  {
    userId: "bot-dragoat",
    username: "DraGoat",
    initial: "D",
    color: "#FF4D5E",
    depositRange: [1, 8],
  },
  {
    userId: "bot-psymaster",
    username: "PsyMaster",
    initial: "P",
    color: "#A855F7",
    depositRange: [2, 7],
  },
];

const USER_COLOR = "#00D4FF";
const USER_ID = "user-self";

// ── Types persisted ─────────────────────────────────────────────────────

export interface JackpotParticipant {
  userId: string;
  username: string;
  initial: string;
  color: string;
  /** Cartes déposées (snapshot — pas une référence à l'inventory) */
  items: InventoryItem[];
  /** Valeur totale déposée par ce participant */
  depositValue: number;
  /** % de chance de gagner = depositValue / totalPot */
  percentage: number;
  /** True si c'est l'utilisateur courant (pour highlight UI) */
  isUser: boolean;
}

export interface JackpotRound {
  id: string;
  /** Timestamp ms — début du round */
  startedAt: number;
  /** Timestamp ms — fin du round (open → drawing) */
  endsAt: number;
  /** Status courant */
  status: "open" | "drawing" | "closed";
  participants: JackpotParticipant[];
  totalPot: number;
  /** Si status === 'closed', userId du gagnant */
  winnerId?: string;
  winnerName?: string;
  /** Pot net après prélèvement house (5%) */
  netPayout?: number;
}

// ── Storage ─────────────────────────────────────────────────────────────

const KEY_CURRENT = "gf:jackpot.current";
const KEY_HISTORY = "gf:jackpot.history";
const KEY_BOTS_SCHEDULED = "gf:jackpot.bots-scheduled";
const HISTORY_CAP = 20;

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `jp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function emitChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("gf:jackpot-changed"));
}

// ── Lecture / écriture ──────────────────────────────────────────────────

function loadCurrent(): JackpotRound | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY_CURRENT);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as JackpotRound;
  } catch {
    return null;
  }
}

function saveCurrent(round: JackpotRound | null): void {
  if (typeof window === "undefined") return;
  if (round === null) localStorage.removeItem(KEY_CURRENT);
  else localStorage.setItem(KEY_CURRENT, JSON.stringify(round));
  emitChanged();
}

function loadHistory(): JackpotRound[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY_HISTORY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as JackpotRound[];
  } catch {
    return [];
  }
}

function pushHistory(round: JackpotRound): void {
  const all = [round, ...loadHistory()].slice(0, HISTORY_CAP);
  localStorage.setItem(KEY_HISTORY, JSON.stringify(all));
}

export function getJackpotHistory(): JackpotRound[] {
  return loadHistory();
}

// ── Création / cycle ────────────────────────────────────────────────────

function recomputePercentages(round: JackpotRound): void {
  const total = round.participants.reduce((s, p) => s + p.depositValue, 0);
  round.totalPot = parseFloat(total.toFixed(2));
  for (const p of round.participants) {
    p.percentage = total > 0 ? p.depositValue / total : 0;
  }
}

function newRound(): JackpotRound {
  const now = Date.now();
  return {
    id: genId(),
    startedAt: now,
    endsAt: now + ROUND_DURATION_MS,
    status: "open",
    participants: [],
    totalPot: 0,
  };
}

/** Schedule random bot deposits over the lifetime of the round. */
function scheduleBots(round: JackpotRound): void {
  if (typeof window === "undefined") return;
  // Anti-double scheduling : on tag le round comme déjà schedulé
  const tagged = localStorage.getItem(KEY_BOTS_SCHEDULED);
  if (tagged === round.id) return;
  localStorage.setItem(KEY_BOTS_SCHEDULED, round.id);

  // Tirage : entre 3 et 5 bots vont déposer pendant le round
  const activeBots = [...BOTS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3 + Math.floor(Math.random() * 3));

  for (const bot of activeBots) {
    // Délai aléatoire ∈ [10%, 85%] du round → laisse de la place pour le user
    const delay = ROUND_DURATION_MS * (0.1 + Math.random() * 0.75);
    setTimeout(() => {
      // Vérifie que le round est toujours actif
      const current = loadCurrent();
      if (!current || current.id !== round.id || current.status !== "open")
        return;
      const value = parseFloat(
        (
          bot.depositRange[0] +
          Math.random() * (bot.depositRange[1] - bot.depositRange[0])
        ).toFixed(2),
      );
      depositAsBot(bot, value);
    }, delay);
  }
}

/**
 * Dépôt d'un bot — purement simulé, pas de vraie carte sous-jacente.
 * On crée des items "ghost" avec value figée pour l'affichage.
 */
function depositAsBot(bot: Bot, value: number): void {
  const round = loadCurrent();
  if (!round || round.status !== "open") return;
  const existing = round.participants.find((p) => p.userId === bot.userId);
  // Item ghost simulé (pas dans l'inventory utilisateur)
  const ghostCount = 1 + Math.floor(Math.random() * 3);
  const perItem = parseFloat((value / ghostCount).toFixed(2));
  const ghostItems: InventoryItem[] = Array.from(
    { length: ghostCount },
    (_, i) => ({
      id: `ghost-${bot.userId}-${Date.now()}-${i}`,
      card: {
        id: "ghost",
        name: "Bot Card",
        nameFr: "Carte Bot",
        set: "",
        setFr: "",
        number: "",
        rarity: "rare",
        value: perItem,
        imageUrl: null,
        dropRate: 0,
        energy: "colorless",
        animTier: "base",
      },
      grade: "raw",
      price: perItem,
      acquiredAt: new Date().toISOString(),
      acquiredFrom: "pack",
      isLocked: true,
    }),
  );

  if (existing) {
    existing.items.push(...ghostItems);
    existing.depositValue = parseFloat(
      (existing.depositValue + value).toFixed(2),
    );
  } else {
    round.participants.push({
      userId: bot.userId,
      username: bot.username,
      initial: bot.initial,
      color: bot.color,
      items: ghostItems,
      depositValue: value,
      percentage: 0,
      isUser: false,
    });
  }
  recomputePercentages(round);
  saveCurrent(round);
}

/**
 * Récupère le round actif, en crée un si nécessaire.
 * Si le round est en status 'drawing' depuis assez longtemps → on le clôt.
 */
export function getJackpotRound(): JackpotRound {
  let round = loadCurrent();
  const now = Date.now();

  // Pas de round → on en crée un
  if (!round) {
    round = newRound();
    saveCurrent(round);
    scheduleBots(round);
    return round;
  }

  // Round ouvert, timer écoulé → bascule en drawing
  if (round.status === "open" && now >= round.endsAt) {
    round.status = "drawing";
    saveCurrent(round);
    // Programme la résolution finale
    setTimeout(() => settleRound(), DRAWING_DURATION_MS);
    return round;
  }

  // Round en drawing depuis longtemps (refresh page) → settle immédiatement
  if (round.status === "drawing" && now - round.endsAt >= DRAWING_DURATION_MS) {
    return settleRound();
  }

  // Toujours valide → ré-schedule les bots si pas encore fait
  if (round.status === "open") {
    scheduleBots(round);
  }

  return round;
}

/**
 * Clôt le round : tire un gagnant pondéré, archive, distribue, démarre un
 * nouveau round.
 */
function settleRound(): JackpotRound {
  const round = loadCurrent();
  if (!round || round.status === "closed") {
    // Round déjà clos ou disparu — recompose un nouveau pour ne pas crasher
    const fresh = newRound();
    saveCurrent(fresh);
    scheduleBots(fresh);
    return fresh;
  }

  // Tirage pondéré par depositValue
  const total = round.totalPot;
  let winner: JackpotParticipant | null = null;
  if (total > 0 && round.participants.length > 0) {
    let r = Math.random() * total;
    for (const p of round.participants) {
      r -= p.depositValue;
      if (r <= 0) {
        winner = p;
        break;
      }
    }
    if (!winner) winner = round.participants[round.participants.length - 1];
  }

  round.status = "closed";
  if (winner) {
    round.winnerId = winner.userId;
    round.winnerName = winner.username;
    const netPayout = parseFloat((total * (1 - HOUSE_FEE)).toFixed(2));
    round.netPayout = netPayout;

    // Si le user a gagné → lui crédite le net en cash (pas les items, plus
    // simple pour la démo : tout est converti en solde)
    if (winner.userId === USER_ID) {
      addBalance(netPayout);
    }
    // Sinon : ses items sont consommés (déjà retirés de l'inventory au dépôt)
  }

  pushHistory(round);

  // Démarre un nouveau round immédiatement
  const next = newRound();
  saveCurrent(next);
  scheduleBots(next);
  emitChanged();
  return round;
}

/**
 * Le user dépose une liste d'items de son inventory dans le pot.
 * Retourne le round mis à jour, ou null si erreur (ex: items invalides).
 */
export function depositToJackpot(
  itemIds: string[],
  username: string,
): { ok: true; round: JackpotRound } | { ok: false; reason: string } {
  if (typeof window === "undefined")
    return { ok: false, reason: "ssr-not-supported" };
  const round = getJackpotRound();
  if (round.status !== "open")
    return { ok: false, reason: "Round déjà fermé. Attends le prochain." };

  // Vérifie que tous les items sont dans l'inventory et non lockés
  const inventory = getInventoryItems();
  const itemsToDeposit: InventoryItem[] = [];
  for (const id of itemIds) {
    const it = inventory.find((x) => x.id === id);
    if (!it) return { ok: false, reason: `Carte ${id} introuvable.` };
    if (it.isLocked) return { ok: false, reason: `Une carte est verrouillée.` };
    itemsToDeposit.push(it);
  }
  if (itemsToDeposit.length === 0)
    return { ok: false, reason: "Sélectionne au moins une carte." };

  const value = parseFloat(
    itemsToDeposit.reduce((s, it) => s + it.price, 0).toFixed(2),
  );
  if (value < MIN_DEPOSIT_VALUE)
    return {
      ok: false,
      reason: `Dépôt minimum $${MIN_DEPOSIT_VALUE.toFixed(2)}.`,
    };

  // Retire les items de l'inventory user
  for (const it of itemsToDeposit) {
    removeInventoryItem(it.id);
  }

  // Ajoute / merge dans la participation du user
  const existing = round.participants.find((p) => p.userId === USER_ID);
  if (existing) {
    existing.items.push(...itemsToDeposit);
    existing.depositValue = parseFloat(
      (existing.depositValue + value).toFixed(2),
    );
    existing.username = username; // refresh si user a changé de pseudo
  } else {
    round.participants.push({
      userId: USER_ID,
      username,
      initial: username.charAt(0).toUpperCase(),
      color: USER_COLOR,
      items: itemsToDeposit,
      depositValue: value,
      percentage: 0,
      isUser: true,
    });
  }
  recomputePercentages(round);
  saveCurrent(round);
  return { ok: true, round };
}

/**
 * Si le user a gagné le round précédent et qu'on veut récupérer les cartes
 * physiques (mode "récupère tes prix"), on peut décider de re-créditer les
 * items dans son inventory. Pour la démo on garde l'option simple = cash
 * uniquement, mais on garde la fonction prête.
 */
export function reclaimWinnings(roundId: string): InventoryItem[] {
  const history = loadHistory();
  const round = history.find((r) => r.id === roundId);
  if (!round || round.winnerId !== USER_ID) return [];
  const items: InventoryItem[] = [];
  for (const p of round.participants) {
    for (const it of p.items) {
      if (it.card.id === "ghost") continue;
      const { item } = addInventoryItem(it.card, it.grade, it.price, "pack");
      items.push(item);
    }
  }
  return items;
}
