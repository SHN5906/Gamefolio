# CardFolio — Design System

> Version 1.0 · 2026-04-28 · Archivé par le skill web-design

---

## 1. Visual Theme & Atmosphere

**Philosophie** : *"Bloomberg Terminal rencontre une salle des marchés Pokémon."*
Interface de trading financier transposée dans l'univers des collectionneurs de cartes. Chaque chiffre doit inspirer confiance, chaque couleur a un sens sémantique précis, chaque animation renforce la perception de données vivantes.

**Mots-clés d'atmosphère** : Deep Space · Data Live · Glassy Layers · Pokémon Energy · Precision Mono

**Archétype** : Dark Tech + Data Dashboard — proche du seed #2 (暗黑科技), enrichi d'une couche de signalétique financière.

**Décision fondatrice** : Le fond est quasiment noir (`#050710`), les surfaces sont des plaques de verre semi-transparent. Aucune couleur n'est "décorative" — chaque teinte porte une valeur sémantique (brand=action, positive=profit, negative=perte, warning=alert, énergie=type Pokémon).

---

## 2. Color Palette & Roles

```css
/* ── CSS Variables (à maintenir dans globals.css @theme) ── */

/* Backgrounds — élévation (du plus sombre au plus clair) */
--color-bg-base:         #050710;          /* RGB: 5,7,16 */
--color-bg-surface:      #0B0F1A;          /* RGB: 11,15,26 */
--color-bg-elevated:     #11162A;          /* RGB: 17,22,42 */
--color-bg-glass:        rgba(255,255,255,0.025);
--color-bg-glass-hi:     rgba(255,255,255,0.05);
--color-bg-glass-active: rgba(255,255,255,0.08);

/* Borders */
--color-border:          rgba(255,255,255,0.06);
--color-border-strong:   rgba(255,255,255,0.12);
--color-border-bright:   rgba(255,255,255,0.18);

/* Text — hiérarchie sur fond sombre */
--color-text-primary:    #F8FAFC;          /* RGB: 248,250,252 */
--color-text-secondary:  rgba(248,250,252,0.62);
--color-text-muted:      rgba(248,250,252,0.32);
--color-text-subtle:     rgba(248,250,252,0.18);

/* Sémantique financière */
--color-positive:        #10D9A0;          /* Hausse / profit */
--color-positive-soft:   rgba(16,217,160,0.12);
--color-positive-glow:   rgba(16,217,160,0.35);
--color-negative:        #FF4D5E;          /* Baisse / perte */
--color-negative-soft:   rgba(255,77,94,0.12);
--color-negative-glow:   rgba(255,77,94,0.35);
--color-warning:         #F5A623;          /* Alerte */
--color-warning-soft:    rgba(245,166,35,0.12);

/* Brand — Bleu électrique (action principale) */
--color-brand:           #2A7DFF;          /* RGB: 42,125,255 */
--color-brand-hi:        #5AA0FF;
--color-brand-soft:      rgba(42,125,255,0.15);
--color-brand-glow:      rgba(42,125,255,0.45);

/* Accents secondaires */
--color-cyan:            #00D4FF;
--color-cyan-soft:       rgba(0,212,255,0.13);
--color-purple:          #8B5CF6;
--color-purple-soft:     rgba(139,92,246,0.13);
--color-pink:            #EC4899;
--color-pink-soft:       rgba(236,72,153,0.13);
--color-pokemon-yellow:  #FFCC00;
--color-pokemon-yellow-soft: rgba(255,204,0,0.15);

/* Énergies Pokémon */
--color-energy-fire:      #FF6B47;
--color-energy-water:     #4FA3FF;
--color-energy-grass:     #7BCB68;
--color-energy-lightning: #FFD43B;
--color-energy-psychic:   #C77DFF;
--color-energy-fighting:  #C76040;
--color-energy-dark:      #424B5F;
--color-energy-metal:     #94A3B8;
--color-energy-fairy:     #F8A5C2;
--color-energy-dragon:    #6B5BA8;
--color-energy-colorless: #A8B2C0;
```

**Règles sémantiques** :
- Brand `#2A7DFF` → uniquement pour les actions primaires et liens actifs
- Positive `#10D9A0` → UNIQUEMENT pour les chiffres de profit/hausse
- Negative `#FF4D5E` → UNIQUEMENT pour les chiffres de perte/baisse
- Warning `#F5A623` → alertes, mode démo, Pro feature
- Énergie → badges type Pokémon, couleur de la carte, jamais pour UI générique

---

## 3. Typography Rules

```css
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');

/* Font families */
--font-display: 'Syne', sans-serif;      /* Titres, chiffres premium, logo */
--font-mono:    'IBM Plex Mono', monospace; /* Prix, %, stats numériques */
--font-body:    'Inter', sans-serif;     /* Texte courant, labels, boutons */
```

**Hiérarchie typographique** :

| Rôle | Police | Taille | Poids | Tracking |
|------|--------|--------|-------|---------|
| H1 Landing | Syne | 40–68px | 800 | -0.035em |
| H1 App | Syne | 24–28px | 700 | -0.02em |
| H2 Section | Syne | 18–22px | 700 | -0.02em |
| H3 Card title | Syne | 14–16px | 700 | -0.01em |
| Body | Inter | 13–14px | 400–500 | -0.005em |
| Label (eyebrow) | Inter | 10–11px | 600 | +1.2–1.5px (uppercase) |
| Prix principal | Syne | 34–60px | 800 | -3px |
| Prix secondaire | IBM Plex Mono | 13–16px | 600 | tabular-nums |
| Badge/tag | IBM Plex Mono | 10–11px | 600 | 0 |

**Règles strictes** :
- Tous les chiffres financiers → `font-family: var(--font-mono)`, `font-variant-numeric: tabular-nums`
- Labels en majuscules (eyebrow) → Inter, `tracking-[1.2px]`, `uppercase`, couleur `text-muted`
- Jamais de `letter-spacing` positif sur du texte de corps (corps = Inter uniquement)

**Texte décoratif (titres uniquement)** :
- Le hero H1 de la landing peut avoir `gradient-text` (dégradé text → secondary)
- Les chiffres de P&L reçoivent une couleur sémantique (positive/negative)
- Aucune décoration sur le texte de corps

---

## 4. Component Stylings

### Bouton Primaire
```css
/* Default */
background: var(--color-brand);
color: white;
border-radius: var(--radius-sm);  /* 8px */
height: 36px (sm) / 40px (md);
padding: 0 12px (sm) / 0 16px (md);
font: Inter 600 12px (sm) / 14px (md);
box-shadow: 0 0 20px var(--color-brand-glow);

/* Hover */
background: var(--color-brand-hi);
box-shadow: 0 0 28px var(--color-brand-glow);
transform: translateY(-1px);

/* Active */
transform: translateY(0);
box-shadow: 0 0 12px var(--color-brand-glow);

/* Focus */
outline: 2px solid var(--color-brand);
outline-offset: 2px;

/* Disabled */
opacity: 0.4;
cursor: not-allowed;
transform: none;
```

### Bouton Ghost
```css
/* Default */
background: var(--color-bg-glass);
border: 1px solid var(--color-border);
color: var(--color-text-secondary);

/* Hover */
border-color: var(--color-border-strong);
background: var(--color-bg-glass-hi);
color: var(--color-text-primary);

/* Focus */
outline: 2px solid var(--color-brand);
```

### Card (Glassmorphism)
```css
/* Default */
background: var(--color-bg-glass);
border: 1px solid var(--color-border);
border-radius: var(--radius);  /* 12px */
backdrop-filter: blur(20px);
box-shadow: var(--shadow-sm);

/* Elevated */
background: var(--color-bg-glass-hi);
border-color: var(--color-border-strong);
box-shadow: var(--shadow-md);

/* Interactive (card-lift) */
transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            box-shadow 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            border-color 0.2s ease;

/* Interactive Hover */
transform: translateY(-2px);
box-shadow: var(--shadow-lg);
border-color: var(--color-border-strong);

/* Inner highlight (top edge, toujours présent) */
::before content inset-x-0 top-0 h-px:
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
```

### Input / Textarea
```css
/* Default */
background: var(--color-bg-glass);
border: 1px solid var(--color-border);
border-radius: var(--radius-sm);  /* 8px */
color: var(--color-text-primary);
font: Inter 13–14px;
height: 36px (compact) / 40px (standard);

/* Focus */
border-color: var(--color-border-strong);
box-shadow: 0 0 0 3px var(--color-brand-soft);
background: var(--color-bg-glass-hi);

/* Error */
border-color: var(--color-negative);
box-shadow: 0 0 0 3px var(--color-negative-soft);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;

/* Placeholder */
color: var(--color-text-subtle);
```

### Select (natif amélioré)
```css
/* Wrapper relatif requis pour l'icône custom */
background: var(--color-bg-glass);
border: 1px solid var(--color-border);
border-radius: var(--radius-sm);
color: var(--color-text-secondary);
appearance: none;
padding-right: 28px;
/* Chevron via pseudo ::after ou icône SVG en background-image */

/* Focus */
border-color: var(--color-border-strong);
box-shadow: 0 0 0 3px var(--color-brand-soft);
outline: none;
```

### Badge / Chip sémantique
```css
/* Positif */
background: var(--color-positive-soft);
border: 1px solid rgba(16,217,140,0.25);
color: var(--color-positive);
border-radius: 999px;
font: IBM Plex Mono 11px 600;

/* Négatif */
background: var(--color-negative-soft);
border: 1px solid rgba(255,77,94,0.25);
color: var(--color-negative);

/* Neutre */
background: var(--color-bg-glass-hi);
border: 1px solid var(--color-border);
color: var(--color-text-muted);
```

### SelectChip (filtre/onglet)
```css
/* Inactif */
background: var(--color-bg-glass);
border: 1px solid var(--color-border);
color: var(--color-text-secondary);
border-radius: var(--radius-sm);
height: 32px;

/* Actif */
background: var(--color-brand);
border-color: var(--color-brand);
color: white;
box-shadow: 0 0 16px var(--color-brand-glow);

/* Hover (inactif) */
background: var(--color-bg-glass-hi);
border-color: var(--color-border-strong);
color: var(--color-text-primary);
```

### Sidebar Nav Item
```css
/* Inactif */
color: var(--color-text-muted);
background: transparent;
border: 1px solid transparent;

/* Hover */
background: var(--color-bg-glass-hi);
border-color: var(--color-border);
color: var(--color-text-primary);

/* Actif */
background: var(--color-brand-soft);
border-color: rgba(42,125,255,0.3);
color: var(--color-text-primary);
box-shadow: 0 0 16px var(--color-brand-glow), inset 0 1px 0 rgba(255,255,255,0.05);
/* + indicateur barre gauche : 3px × 20px, fond brand, boxShadow brand-glow */
```

### Topbar (sticky)
```css
background: rgba(5,7,16,0.72);
backdrop-filter: blur(20px) saturate(180%);
border-bottom: 1px solid var(--color-border);
position: sticky; top: 0; z-index: 20;
```

---

## 5. Layout Principles

**Grille principale** :
```
Sidebar (60px fixe) | Contenu principal (flex-1)
  ↕ Topbar sticky (48px)
  ↕ Contenu scrollable
  ↕ Bottom nav mobile (visible < md)
```

**Conteneurs** :
- App content : `max-width: 1280px`, centré, padding `px-4 sm:px-6 md:px-8`
- Landing : `max-width: 1200px` (nav/sections), `max-width: 900px` (hero CTA final)
- Cards grid : `minmax(130–140px, 1fr)`, gap `8–12px`
- Stats grid : 2 cols mobile → 4 cols desktop

**Espacement** :
```
Section gap :     24–28px (mb-6 / mb-7)
Card padding :    16–20px (p-4 / p-5)
Compact padding : 8–12px (p-2 / p-3)
Form gap :        16–20px (gap-4 / gap-5)
```

**Règles de densité** :
- App : densité haute (données nombreuses), espacement compact
- Landing : densité basse, grands blancs, hiérarchie par taille

---

## 6. Depth & Elevation

**Système de 5 niveaux** :
```
L0 : fond       bg-base (#050710)        — aucune ombre
L1 : surface    bg-surface (#0B0F1A)     — shadow-xs
L2 : verre      bg-glass                 — shadow-sm + backdrop-blur
L3 : élevé      bg-glass-hi              — shadow-md + backdrop-blur
L4 : flottant   bg-elevated              — shadow-lg + backdrop-blur (modales, tooltips)
L5 : hero       gradient spécial         — shadow-xl + outer glow brand
```

**Halos atmosphériques** (body::before, pointer-events: none, z-index: 0) :
- Top-left : `radial-gradient(ellipse 70% 50%, rgba(42,125,255,0.22), transparent 65%)` → brand
- Bottom-right : `radial-gradient(ellipse 55% 45%, rgba(0,212,255,0.10), transparent 60%)` → cyan
- Top-right : `radial-gradient(ellipse 40% 35%, rgba(255,204,0,0.05), transparent 55%)` → pokémon yellow
- Bottom-left : `radial-gradient(ellipse 35% 30%, rgba(139,92,246,0.06), transparent 55%)` → purple

**Grain texture** (body::after, z-index: 0, mix-blend-mode: overlay) :
- SVG feTurbulence baseFrequency 0.85, opacity 0.025

**Glow d'accentuation** :
- brand-glow : `0 0 32px var(--color-brand-glow)`
- Tous les éléments actifs brand reçoivent ce glow
- Indicateur live (point vert) : `0 0 6–8px var(--color-positive-glow)`
- Indicateur alerte (point rouge) : `0 0 8px var(--color-negative-glow)`

---

## 7. Animation & Interaction

**档位 L2 — Fluide & Interactif**

### Transitions de base
```css
/* Tous les éléments interactifs */
transition: all 0.15–0.20s ease;
transition-timing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### Entrée de page (fadeIn)
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Appliqué sur les sections principales au montage */
```

### Shimmer (skeleton loading)
```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.shimmer {
  background: linear-gradient(90deg,
    var(--color-bg-glass) 25%,
    var(--color-bg-glass-hi) 50%,
    var(--color-bg-glass) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s infinite;
}
```

### Pulse live (indicateurs de données en direct)
```css
@keyframes pulse-live {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
.pulse-live { animation: pulse-live 1.6s ease-in-out infinite; }
```

### Compteur animé (Framer Motion)
```tsx
// Prix hero : animate(from, to, { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] })
// Déclenché quand totalValue change
```

### Holographic shimmer (card hover)
```css
/* CollectionCard : ::after ou div overlay */
opacity: 0;
background: linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.4) 50%, transparent 65%);
transition: opacity 0.7s;
/* :hover → opacity: 0.3 */
```

### Card lift (interactif)
```css
transition: transform 0.2s cubic-bezier(...), box-shadow 0.2s, border-color 0.2s;
/* :hover → translateY(-2px), shadow-lg, border-strong */
```

### prefers-reduced-motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Do's and Don'ts

### ✅ À FAIRE

1. **Couleur sémantique stricte** — positive uniquement pour profit, negative pour perte. Jamais utiliser ces couleurs pour d'autres besoins visuels.
2. **Chiffres financiers en mono** — tout prix, pourcentage, et statistique chiffrée utilise IBM Plex Mono avec `tabular-nums`.
3. **CSS variables partout** — zéro hex hardcodé dans les composants. Toujours `var(--color-*)`.
4. **Indiquer les données live** — tout composant affichant des données en temps réel porte un point vert `.pulse-live` + label "Live".
5. **Glassmorphism sur les surfaces** — backdrop-filter blur(12–20px) sur toutes les cards et la sidebar.
6. **Hiérarchie via opacité** — utiliser les niveaux de transparence text-primary/secondary/muted/subtle, jamais inventer une nouvelle couleur texte.
7. **Focus ring visible** — `outline: 2px solid var(--color-brand); outline-offset: 2px;` sur tout élément focusable.
8. **État vide explicite** — chaque liste/grille vide affiche un état vide avec icône, message, et CTA si approprié.

### ❌ À ÉVITER

1. **Hex hardcodé** dans les composants — ex: `color: '#FF4D5E'` → doit être `color: 'var(--color-negative)'`.
2. **Fond blanc ou clair** dans les composants de l'app — tout appartient à la palette sombre.
3. **backdrop-filter blur > 24px sur des éléments larges** — causes de performances sur mobile.
4. **Couleur positive/negative pour autre chose que P&L** — ne pas recycler pour indiquer un état UI générique.
5. **Texte sans hiérarchie** — chaque texte doit être primary, secondary, muted ou subtle. Jamais blanc pur (#ffffff) sans opacité.
6. **Animation sur scroll sans prefers-reduced-motion** — toujours ajouter la media query de fallback.
7. **Image placeholder en couleur unie** — toujours utiliser le gradient d'énergie Pokémon ou l'image réelle.
8. **Données utilisateur hardcodées** — nom, avatar, et email doivent venir de Supabase auth, jamais en dur dans le code.

---

## 9. Responsive Behavior

**Breakpoints Tailwind** :
```
mobile  :  < 640px   (sm)
tablet  : 640–768px  (md)
desktop : ≥ 768px    (lg+)
```

**Sidebar** :
- `>= md` : sidebar verticale 60px, toujours visible
- `< md`  : masquée, remplacée par bottom nav (MobileNav)

**Topbar** :
- `< sm` : logo CF visible, greeting masqué, search full width
- `>= sm` : greeting visible, download button visible, search max-width: 420px

**Grille cards** :
- Mobile : `minmax(135px, 1fr)` → généralement 2–3 cols
- Desktop : idem avec plus de colonnes automatiques

**Stats grid** :
- Mobile : 2 cols
- Desktop : 4 cols

**Touch targets** :
- Tous les éléments interactifs ≥ 44×44px sur mobile
- La bottom nav MobileNav : items de 44px minimum

**Hero Landing** :
- Mobile : H1 40px, stacked layout
- Desktop : H1 68px, grid 2 cols pour certaines sections

**Formulaires** :
- Mobile : pleine largeur, labels au-dessus
- Labels de section (SectionLabel) : toujours visibles
- SelectChips : flex-wrap pour s'adapter
