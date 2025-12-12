# STAKE DNA - Lootea Design System v3.0

> Documentación ultra detallada del sistema de diseño basado en Stake Casino.
> Última actualización: Diciembre 2024

---

## 📐 FILOSOFÍA DE DISEÑO

### Flat Design Puro
Stake utiliza **"Elevation through Color"** - elevación visual mediante colores, NO mediante:
- ❌ Borders visibles (excepto winner highlight)
- ❌ Box-shadows
- ❌ Gradients en UI
- ❌ Glow effects
- ❌ Efectos 3D

### Jerarquía Visual por Capas
```
Nivel 0 (más profundo): #0f212e - Page bg, inputs, áreas hundidas
Nivel 1:                #1a2c38 - Containers, sidebars, cards
Nivel 2:                #213743 - Elementos interactivos, toggles activos
Nivel 3 (más elevado):  #2f4553 - Hover states, active states
```

### Principios Clave
1. **Inputs SIEMPRE más oscuros** que su contenedor
2. **Elementos activos más claros** que inactivos
3. **Nunca mismo tono** para elementos adyacentes
4. **Consistencia obsesiva** en spacing y radius
5. **Todo contenido agrupado va en un CONTAINER** con `#1a2c38`

---

## 📦 SECTION CONTAINERS (CRÍTICO)

### Regla Principal
**TODO el contenido agrupado debe estar dentro de un container `#1a2c38`**

```
PAGE (#0f212e)
│
├── SECTION CONTAINER (#1a2c38, radius 8px)
│   ├── Header (tabs, title, controls)
│   └── Content (grid, table, list)
│
├── SECTION CONTAINER (#1a2c38, radius 8px)
│   └── ...
```

### Section Container Style
```css
background: #1a2c38;
border-radius: 8px;
/* NO padding interno - el contenido maneja su spacing */
overflow: hidden; /* Para que el radius aplique a hijos */
```

### Tab Header dentro de Container
```
┌─────────────────────────────────────────────────────────────────┐
│ [My Bets] [All Bets] [High Rollers]           [🔧] [10 ▼]      │
├─────────────────────────────────────────────────────────────────┤
│ Game        Time        Bet Amount    Multiplier    Payout     │
├─────────────────────────────────────────────────────────────────┤
│ 🎰 Blackjack  6:56 PM    0.0000 ₿        2.00x     0.0000 ₿   │
│ ⚫ Mines      6:56 PM    0.0000 ₿        1.48x     0.0000 ₿   │
│ 🎲 Dice      6:56 PM    0.0000 ₿        1.09x     0.0000 ₿   │
└─────────────────────────────────────────────────────────────────┘
```

### Blog/Grid Cards dentro de Container
```
┌─────────────────────────────────────────────────────────────────┐
│ [All Blogs] [Crypto] [How to Guides] [Esports] [News]          │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │ 🖼️ IMG  │ │ 🖼️ IMG  │ │ 🖼️ IMG  │ │ 🖼️ IMG  │               │
│ │─────────│ │─────────│ │─────────│ │─────────│               │
│ │ Title   │ │ Title   │ │ Title   │ │ Title   │               │
│ │ Desc    │ │ Desc    │ │ Desc    │ │ Desc    │               │
│ │ Date    │ │ Date    │ │ Date    │ │ Date    │               │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 DATA TABLES

### Table Structure
```css
/* Container */
background: #1a2c38;
border-radius: 8px;
overflow: hidden;

/* Header row */
background: transparent; /* Same as container */
padding: 12px 16px;
color: #5f6c7b;
font-size: 12px;
font-weight: 500;
text-transform: none;

/* Data rows */
padding: 12px 16px;
color: #ffffff;
border-bottom: none; /* NO borders between rows */
/* Alternating: some rows have very subtle bg difference */

/* Hover row */
background: #213743;
```

### Table Values
```css
/* Positive/Win values */
color: #00e701;

/* Negative/Loss values */
color: #ef4444;

/* Neutral values */
color: #ffffff;

/* Currency icons inline */
display: inline-flex;
align-items: center;
gap: 4px;
```

---

## 🖥️ LAYOUT DESKTOP (GAME PAGES)

### Estructura Sidebar + Game Area
```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: Logo + Balance + User                                   │
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│  CONTROL PANEL   │           GAME AREA                          │
│  #1a2c38         │           #0f212e                            │
│  width: 280px    │           flex: 1                            │
│                  │                                              │
│  [Manual][Auto]  │      ┌──────────────────────┐               │
│                  │      │                      │               │
│  Bet Amount      │      │    GAME CONTENT      │               │
│  [0.00000][½][2x]│      │                      │               │
│                  │      └──────────────────────┘               │
│  [Dropdown ▼]    │                                              │
│                  │      [1.15x][1.37x][1.64x][2.00x]            │
│  [====BET====]   │                                              │
│                  │                                              │
│  Profit: $0.00   │                                              │
│                  │                                              │
├──────────────────┴──────────────────────────────────────────────┤
│ TOOLBAR: [⚙️][⛶][📊][↗️]        Stake        [✓ Fairness]      │
├─────────────────────────────────────────────────────────────────┤
│ GAME INFO: Title + Tabs + Description                           │
└─────────────────────────────────────────────────────────────────┘
```

### Dimensiones Desktop
| Elemento | Width | Notes |
|----------|-------|-------|
| Control Panel | 280px | Fixed sidebar |
| Game Area | flex: 1 | Remaining space |
| Max Container | 1400px | Centered |
| Toolbar Height | 56px | Fixed |

---

## 🎨 PALETA DE COLORES

### Backgrounds (Azules)
| Token | Hex | Uso |
|-------|-----|-----|
| `--stake-bg-darkest` | `#0f212e` | Page bg, inputs, game areas |
| `--stake-bg-primary` | `#1a2c38` | Sidebars, panels, modals |
| `--stake-bg-secondary` | `#213743` | Buttons, toggles activos, dropdowns |
| `--stake-bg-hover` | `#2f4553` | Hover, active, selected states |

### Acentos
| Token | Hex | Uso |
|-------|-----|-----|
| `--stake-green` | `#00e701` | CTA principal (Bet/Open), wins |
| `--stake-blue` | `#3b82f6` | Wallet, Deposit, links |
| `--stake-red` | `#ef4444` | Errores, pérdidas, danger |
| `--stake-orange` | `#f59e0b` | Warnings, medium values |
| `--stake-yellow` | `#eab308` | Highlights, mid multipliers |

### Texto
| Token | Hex | Uso |
|-------|-----|-----|
| `--stake-text-primary` | `#ffffff` | Títulos, valores importantes |
| `--stake-text-secondary` | `#b1bad3` | Labels, texto normal |
| `--stake-text-muted` | `#5f6c7b` | Placeholders, disabled, hints |

### Multiplier Colors (Plinko/Games)
```css
/* Low multipliers */
--mult-low: #ef4444;      /* 0.1x - 0.5x (red) */
--mult-med-low: #f97316;  /* 0.5x - 1x (orange) */
--mult-med: #eab308;      /* 1x - 2x (yellow) */
--mult-med-high: #84cc16; /* 2x - 5x (lime) */
--mult-high: #00e701;     /* 5x+ (green) */
```

---

## 📝 TIPOGRAFÍA

### Fuente
```css
font-family: 'Outfit', system-ui, -apple-system, sans-serif;
```

### Escala de Tamaños
| Token | Size | Use |
|-------|------|-----|
| `text-xs` | 11px | Badges, micro labels |
| `text-sm` | 13px | Labels, secondary text |
| `text-base` | 14px | Body text, inputs |
| `text-lg` | 16px | Important values |
| `text-xl` | 18px | Section titles |
| `text-2xl` | 24px | Page titles |
| `text-4xl` | 36px | Hero numbers (multipliers) |
| `text-6xl` | 60px | Giant displays |

### Pesos
| Weight | Use |
|--------|-----|
| 400 | Body text |
| 500 | Labels |
| 600 | Buttons secondary |
| 700 | CTAs, titles, prices |

---

## 🔘 BORDER RADIUS

| Elemento | Radius | CSS |
|----------|--------|-----|
| Inputs | 8px | `rounded-lg` |
| Buttons | 8px | `rounded-lg` |
| Cards | 8px | `rounded-lg` |
| Containers/Panels | 8px | `rounded-lg` |
| Modals | 12px | `rounded-xl` |
| Pills/Toggles | 9999px | `rounded-full` |
| Small badges | 4px | `rounded` |
| Dropdowns | 8px | `rounded-lg` |

---

## 🔲 COMPONENTES DETALLADOS

### 1. Toggle Switch (Manual/Auto)
```
┌─────────────────────────────────────┐
│ [Manual] │  Auto  │      [⚡]      │ ← Icon opcional
└─────────────────────────────────────┘
  ↑ active    ↑ inactive
  #213743     transparent
  white       #b1bad3
```
```css
/* Container */
background: #0f212e;
border-radius: 9999px;
padding: 4px;

/* Active option */
background: #213743;
color: #ffffff;
border-radius: 9999px;
padding: 8px 16px;

/* Inactive option */
background: transparent;
color: #b1bad3;
```

### 2. Bet Amount Input (Con acciones)
```
┌──────────────────────────────────────────────┐
│ Bet Amount                           $0.00   │ ← Label row
├──────────────────────────────────────────────┤
│ [0.00000000] [₿] │ [½] │ [2x]               │ ← Input + actions
└──────────────────────────────────────────────┘
```
```css
/* Label row */
display: flex;
justify-content: space-between;
color: #5f6c7b;
font-size: 12px;
margin-bottom: 8px;

/* Input container */
background: #0f212e;
border-radius: 8px;
display: flex;
align-items: center;

/* Input field */
background: transparent;
color: #ffffff;
flex: 1;
padding: 12px;

/* Crypto icon */
background: #f7931a; /* BTC orange */
border-radius: 50%;
width: 20px;
height: 20px;

/* Action buttons (½, 2x) */
background: #2f4553;
color: #b1bad3;
padding: 4px 8px;
border-radius: 4px;
font-size: 12px;
margin-left: 4px;
```

### 3. Dropdown Select
```
┌──────────────────────────────────────────────┐
│ Difficulty                                   │ ← Label
├──────────────────────────────────────────────┤
│ Medium                                    ▼  │ ← Closed
└──────────────────────────────────────────────┘

/* Expanded */
┌──────────────────────────────────────────────┐
│ Medium                                    ▲  │
├──────────────────────────────────────────────┤
│ 🔍 Search                                    │ ← Search (optional)
├──────────────────────────────────────────────┤
│ Easy                                         │
│ Medium                                    ✓  │ ← Selected
│ Hard                                         │
│ Expert                                       │
└──────────────────────────────────────────────┘
```
```css
/* Closed state */
background: #213743;
border-radius: 8px;
padding: 12px 16px;
color: #ffffff;
display: flex;
justify-content: space-between;

/* Chevron */
color: #5f6c7b;
transition: transform 0.2s;
/* Rotates 180deg when open */

/* Dropdown panel */
background: #1a2c38;
border-radius: 8px;
margin-top: 4px;
overflow: hidden;

/* Search input inside */
background: #0f212e;
margin: 8px;
border-radius: 8px;

/* Option */
padding: 12px 16px;
color: #b1bad3;
/* Hover: bg #213743, color #ffffff */

/* Selected option */
color: #ffffff;
/* Checkmark on right */
```

### 4. Primary CTA Button
```css
background: #00e701;
color: #000000;
font-weight: 700;
font-size: 14px;
padding: 14px 24px;
border-radius: 8px;
width: 100%;
text-transform: none;
/* NO border, NO shadow */

/* Hover */
background: #00c700;

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

### 5. Secondary Button
```css
background: #213743;
color: #b1bad3;
font-weight: 600;
padding: 12px 20px;
border-radius: 8px;

/* Hover */
background: #2f4553;
color: #ffffff;
```

### 6. Action Buttons Grid (Hit/Stand/Split/Double)
```
┌─────────────┬─────────────┐
│  Hit  🃏    │  Stand 🛑   │
├─────────────┼─────────────┤
│  Split 🔀   │  Double ×2  │
└─────────────┴─────────────┘
```
```css
/* Each button */
background: #213743;
color: #b1bad3;
padding: 12px;
border-radius: 8px;
display: flex;
align-items: center;
justify-content: center;
gap: 8px;

/* Emoji/icon */
font-size: 16px;

/* Disabled */
opacity: 0.5;
```

---

## 💰 WALLET MODAL

### Structure
```
┌──────────────────────────────────────────────┐
│ 💳 Wallet                               ✕    │ ← Header
├──────────────────────────────────────────────┤
│ [Overview][Buy Crypto][Swap Crypto][Tip]     │ ← Tabs
├──────────────────────────────────────────────┤
│                                              │
│         [Wallet Illustration]                │ ← Empty state
│                                              │
│   Your Stake Wallet is Currently Empty       │
│                                              │
│   Description text here...                   │
│                                              │
│   [====Deposit====] [Buy Crypto]             │ ← Actions
│                                              │
├──────────────────────────────────────────────┤
│ 🔒 Improve security with 2FA                 │
│ [==========Enable 2FA==========]             │ ← Footer CTA
└──────────────────────────────────────────────┘
```

### Deposit Flow
```
Step 1: Method Selection
┌──────────────────────────────────────────────┐
│ ← Deposit                                    │
├──────────────────────────────────────────────┤
│ [  Crypto  ] [ Local Currency ]              │ ← Toggle
├──────────────────────────────────────────────┤
│ Currency                                     │
│ ┌────────────────────────────────────────┐   │
│ │ 🪙 BTC                              ▼  │   │ ← Dropdown
│ │    Bitcoin                             │   │
│ └────────────────────────────────────────┘   │
├──────────────────────────────────────────────┤
│ [===========Deposit===========]              │ ← CTA (Green)
└──────────────────────────────────────────────┘

Step 2: Address Display (Crypto)
┌──────────────────────────────────────────────┐
│ Address                                      │
│ ┌────────────────────────────────────────┐   │
│ │ bc1qqzk...5d   [🔄] [📋]               │   │ ← Copy/Refresh
│ └────────────────────────────────────────┘   │
│                                              │
│            ┌──────────┐                      │
│            │ QR CODE  │                      │
│            │          │                      │
│            └──────────┘                      │
│                                              │
│ ─────────── Or ───────────                   │ ← Divider
│                                              │
│ Direct Deposit  [🪙][🪙][🪙] +300            │
│                                              │
│ Credited           1 Confirmation            │
└──────────────────────────────────────────────┘
```

### Modal Tab Style
```css
/* Tab container */
background: #0f212e;
border-radius: 9999px;
padding: 4px;
display: flex;

/* Inactive tab */
color: #b1bad3;
padding: 10px 16px;
border-radius: 9999px;

/* Active tab */
background: #213743;
color: #ffffff;
```

---

## 🎰 GAME AREA

### Background Layers
```css
/* Page */
background: #0f212e;

/* Game container */
background: #1a2c38;
border-radius: 12px;

/* Game area (inside) */
background: #0f212e;
margin: 12px;
border-radius: 8px;
```

### Multiplier Display (Large)
```css
/* Giant multiplier (Limbo, Crash) */
font-size: 72px;
font-weight: 700;
color: #ffffff;
/* or colored based on value */
```

### Multiplier Pills (Plinko, Chicken)
```css
/* Container */
display: flex;
gap: 4px;

/* Pill */
padding: 8px 12px;
border-radius: 6px;
font-weight: 700;
font-size: 13px;
min-width: 48px;
text-align: center;

/* Color by value */
background: var(--mult-color);
color: #000000; /* or white for dark pills */
```

### Info Inputs Row (Dice game style)
```
┌────────────────┬────────────────┬────────────────┐
│ Multiplier     │ Roll Over      │ Win Chance     │
│ [2.0000    ×]  │ [50.50     ⟲]  │ [49.50%    ⚂]  │
└────────────────┴────────────────┴────────────────┘
```
```css
/* Label */
color: #5f6c7b;
font-size: 11px;
margin-bottom: 4px;

/* Input container */
background: #213743;
border-radius: 8px;
display: flex;
align-items: center;

/* Input */
background: transparent;
color: #ffffff;
flex: 1;
padding: 10px 12px;

/* Action icon */
color: #5f6c7b;
padding: 8px;
cursor: pointer;
/* Hover: color #b1bad3 */
```

---

## 🔧 TOOLBAR (Bottom of game)

### Layout
```
┌────────────────────────────────────────────────────────────────┐
│ [⚙️] [⛶] [📊] [↗️]           Stake           [✓ Fairness]     │
└────────────────────────────────────────────────────────────────┘
   ↑ left icons              ↑ center logo      ↑ right badge
```

### Styles
```css
/* Container */
background: #1a2c38; /* Same as game container */
padding: 12px 16px;
display: flex;
align-items: center;
justify-content: space-between;

/* Icon button */
padding: 8px;
color: #5f6c7b;
border-radius: 4px;
/* Hover: bg #213743, color #b1bad3 */

/* Center logo */
color: #ffffff;
font-weight: 700;
font-size: 16px;

/* Fairness badge */
background: #213743;
color: #b1bad3;
padding: 8px 12px;
border-radius: 6px;
font-size: 12px;
display: flex;
align-items: center;
gap: 6px;
```

---

## 📋 GAME INFO SECTION

### Structure
```
┌────────────────────────────────────────────────────────────────┐
│ Chicken   Stake Originals                    🏆 181,060.88× ▼  │
├────────────────────────────────────────────────────────────────┤
│ [Description] [Big Wins] [Lucky Wins] [Challenges]             │
├────────────────────────────────────────────────────────────────┤
│ ┌─────────┐  Edge: 2.00%  Provably Fair  Stake Originals      │
│ │         │                                                    │
│ │ 🐔 IMG  │  Description text here explaining the game...      │
│ │         │                                                    │
│ └─────────┘                                                    │
│                                                                │
│ ## How to Play                                                 │
│ Instructions here...                                           │
└────────────────────────────────────────────────────────────────┘
```

### Badges
```css
/* Edge badge */
background: #213743;
color: #b1bad3;
padding: 4px 8px;
border-radius: 4px;
font-size: 11px;

/* Provably Fair badge */
background: #213743;
color: #b1bad3;
/* Same style */
```

### Tabs
```css
/* Active tab */
background: #213743;
color: #ffffff;
padding: 10px 16px;
border-radius: 8px;

/* Inactive tab */
background: transparent;
color: #b1bad3;
padding: 10px 16px;
```

### Max Win Badge
```css
background: #213743;
color: #f59e0b; /* Gold/orange */
padding: 8px 16px;
border-radius: 8px;
font-weight: 600;
display: flex;
align-items: center;
gap: 6px;
/* Trophy icon: 🏆 */
```

---

## 🏆 WINNER ANIMATION

### Green Border Only (Stake Style)
```css
/* Winner card */
border: 3px solid #00e701;
border-radius: 8px;
/* Shape: SQUARE (width = height) */

/* Pulse animation */
animation: winnerBorderPulse 1.2s ease-in-out infinite;

@keyframes winnerBorderPulse {
  0%, 100% { box-shadow: 0 0 0 0 transparent; }
  50% { box-shadow: 0 0 0 2px rgba(0, 231, 1, 0.3); }
}
```

### Loser Fade
```css
animation: loserFade 0.4s ease-out forwards;

@keyframes loserFade {
  to {
    opacity: 0.25;
    transform: scale(0.92);
  }
}
```

### Price Display Options
1. **Inside card** - badge en la parte inferior
2. **Bottom bar** - barra verde adjunta al marco
3. **Floating pill** - pill verde debajo separado

---

## 📱 RESPONSIVE

### Breakpoints
| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 768px | Stacked (controls above game) |
| Tablet | 768-1024px | Sidebar narrower |
| Desktop | 1024-1400px | Full sidebar |
| Large | > 1400px | Extra spacing |

### Mobile Adaptations
- Controls stack above game area
- Full-width inputs
- Tabs become scrollable
- Modal becomes full-screen
- Bottom nav appears

---

## ⚡ SPACING SYSTEM

### Base: 4px grid
| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 4px | Tight gaps |
| `space-2` | 8px | Default gaps |
| `space-3` | 12px | Section gaps |
| `space-4` | 16px | Container padding |
| `space-5` | 20px | Large gaps |
| `space-6` | 24px | Section margins |

### Component Spacing
- Button padding: 12px 24px
- Input padding: 12px 16px
- Card padding: 16px
- Modal padding: 24px
- Section gaps: 16px - 24px

---

## ❌ NUNCA HACER

1. ❌ Borders en elementos (excepto winner)
2. ❌ Box-shadows para elevación
3. ❌ Gradients en backgrounds
4. ❌ Glow effects excesivos
5. ❌ Verde para acciones de dinero (usar azul)
6. ❌ Azul para acciones de juego (usar verde)
7. ❌ Radius inconsistentes
8. ❌ Colores fuera de paleta
9. ❌ Spacing no múltiplo de 4px
10. ❌ Inputs más claros que contenedor

---

## ✅ CHECKLIST

- [ ] Colores de paleta únicamente
- [ ] Sin borders visibles
- [ ] Sin shadows
- [ ] Radius consistentes (8px default)
- [ ] Inputs más oscuros (#0f212e)
- [ ] CTA verde = juego, azul = dinero
- [ ] Spacing múltiplo de 4px
- [ ] Fuente Outfit
- [ ] Responsive funcional
- [ ] Animaciones suaves

---

*Última actualización: Diciembre 2024*
*Basado en análisis de: Chicken, Plinko, Blackjack, Dice, Limbo, Wallet*
