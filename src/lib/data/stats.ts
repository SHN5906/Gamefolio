// Stats de gameplay persistées en localStorage — alimentent les missions.
//
// Granularité : compteurs nommés, reset quotidien et hebdomadaire automatique.
// Chaque incrément déclenche un dispatch d'event pour que les hooks resync.

const KEY = "gf:stats.v1";
const EVENT = "gf:stats-changed";

export type StatName =
  | "opens"
  | "holos"
  | "jackpotVisits"
  | "battles"
  | "battlesWon"
  | "wheelSpins"
  | "wheelWins"
  | "regrades";

export interface GameStats {
  /** Counters all-time */
  total: Record<StatName, number>;
  /** Counters reset daily (00:00 local) */
  daily: Record<StatName, number>;
  /** Counters reset weekly (lundi 00:00) */
  weekly: Record<StatName, number>;
  /** ISO date YYYY-MM-DD du dernier reset daily */
  dailyDate: string;
  /** ISO date YYYY-MM-DD du lundi du dernier reset weekly */
  weeklyDate: string;
  /** Streak jours consécutifs de connexion */
  streakDays: number;
  /** Dernière date où on a vu le user (pour incrémenter le streak) */
  lastSeen: string;
}

function emptyCounters(): Record<StatName, number> {
  return {
    opens: 0,
    holos: 0,
    jackpotVisits: 0,
    battles: 0,
    battlesWon: 0,
    wheelSpins: 0,
    wheelWins: 0,
    regrades: 0,
  };
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function mondayISO(d = new Date()): string {
  // Renvoie la date du lundi de la semaine de `d` (ISO YYYY-MM-DD).
  // getDay() : 0=dimanche, 1=lundi … 6=samedi. On veut lundi de cette semaine.
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // lundi = day-1 si jour=lundi diff=0
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function defaultStats(): GameStats {
  return {
    total: emptyCounters(),
    daily: emptyCounters(),
    weekly: emptyCounters(),
    dailyDate: todayISO(),
    weeklyDate: mondayISO(),
    streakDays: 0,
    lastSeen: "",
  };
}

function emit(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

function loadRaw(): GameStats {
  if (typeof window === "undefined") return defaultStats();
  const raw = localStorage.getItem(KEY);
  if (!raw) return defaultStats();
  try {
    const parsed = JSON.parse(raw) as Partial<GameStats>;
    // Merge avec defaults pour tolérer les anciens schémas
    return {
      ...defaultStats(),
      ...parsed,
      total: { ...emptyCounters(), ...(parsed.total ?? {}) },
      daily: { ...emptyCounters(), ...(parsed.daily ?? {}) },
      weekly: { ...emptyCounters(), ...(parsed.weekly ?? {}) },
    };
  } catch {
    return defaultStats();
  }
}

function save(stats: GameStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(stats));
  emit();
}

/**
 * Lit les stats avec reset daily/weekly automatique si la date a changé.
 * Met aussi à jour le streak si lastSeen < today.
 */
export function getStats(): GameStats {
  const stats = loadRaw();
  const today = todayISO();
  const monday = mondayISO();
  let dirty = false;

  if (stats.dailyDate !== today) {
    stats.daily = emptyCounters();
    stats.dailyDate = today;
    dirty = true;
  }
  if (stats.weeklyDate !== monday) {
    stats.weekly = emptyCounters();
    stats.weeklyDate = monday;
    dirty = true;
  }

  // Streak : si lastSeen est hier → +1, si > 1 jour → reset à 1, si today → no-op
  if (stats.lastSeen !== today) {
    const lastDate = stats.lastSeen ? new Date(stats.lastSeen) : null;
    const todayDate = new Date(today);
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().slice(0, 10);

    if (lastDate && stats.lastSeen === yesterdayISO) {
      stats.streakDays = stats.streakDays + 1;
    } else if (!lastDate) {
      stats.streakDays = 1;
    } else {
      stats.streakDays = 1;
    }
    stats.lastSeen = today;
    dirty = true;
  }

  if (dirty) save(stats);
  return stats;
}

/** Incrémente un compteur sur les 3 buckets (total/daily/weekly). */
export function incrementStat(name: StatName, by = 1): void {
  const stats = getStats();
  stats.total[name] = (stats.total[name] ?? 0) + by;
  stats.daily[name] = (stats.daily[name] ?? 0) + by;
  stats.weekly[name] = (stats.weekly[name] ?? 0) + by;
  save(stats);
}

/** Reset complet — utile pour debug ou « reset compte ». */
export function resetStats(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  emit();
}

// ── Claim missions ──────────────────────────────────────────────────────
// On persiste l'état "claimed" par mission pour que ça survive au refresh.

const CLAIM_KEY = "gf:missions.claimed.v1";

export interface ClaimState {
  /** Map missionId → ISO date du claim. Reset daily pour les daily, weekly pour les weekly. */
  daily: Record<string, string>;
  weekly: Record<string, string>;
  /** ISO date de reset des buckets */
  dailyDate: string;
  weeklyDate: string;
}

function defaultClaims(): ClaimState {
  return {
    daily: {},
    weekly: {},
    dailyDate: todayISO(),
    weeklyDate: mondayISO(),
  };
}

export function getClaimState(): ClaimState {
  if (typeof window === "undefined") return defaultClaims();
  const raw = localStorage.getItem(CLAIM_KEY);
  let claims = defaultClaims();
  if (raw) {
    try {
      claims = {
        ...defaultClaims(),
        ...(JSON.parse(raw) as Partial<ClaimState>),
      };
    } catch {
      claims = defaultClaims();
    }
  }
  const today = todayISO();
  const monday = mondayISO();
  let dirty = false;
  if (claims.dailyDate !== today) {
    claims.daily = {};
    claims.dailyDate = today;
    dirty = true;
  }
  if (claims.weeklyDate !== monday) {
    claims.weekly = {};
    claims.weeklyDate = monday;
    dirty = true;
  }
  if (dirty && typeof window !== "undefined") {
    localStorage.setItem(CLAIM_KEY, JSON.stringify(claims));
  }
  return claims;
}

export function markClaimed(missionId: string, type: "daily" | "weekly"): void {
  if (typeof window === "undefined") return;
  const claims = getClaimState();
  claims[type][missionId] = new Date().toISOString();
  localStorage.setItem(CLAIM_KEY, JSON.stringify(claims));
  emit();
}

export function isClaimed(
  missionId: string,
  type: "daily" | "weekly",
): boolean {
  const claims = getClaimState();
  return Boolean(claims[type][missionId]);
}
