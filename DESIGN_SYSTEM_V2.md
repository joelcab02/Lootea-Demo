# LOOTEA Design System V2 - Cinematic Premium

> **Estilo**: Premium, cinematográfico, futurista. Inspirado en renders 3D de lujo.

---

## 🎨 Paleta de Colores

### Core Colors (Cinematic)
| Token | Hex | Uso |
|-------|-----|-----|
| `--lootea-black` | `#000000` | True black, fondos profundos |
| `--lootea-charcoal` | `#0e0e0f` | Fondo principal de la app |
| `--lootea-matte` | `#111111` | Superficies elevadas |
| `--lootea-surface` | `#161618` | Cards, paneles |
| `--lootea-surface-hover` | `#1c1c1e` | Hover en surfaces |
| `--lootea-border` | `#1a1a1c` | Bordes sutiles |
| `--lootea-border-light` | `#252528` | Bordes más visibles |

### Gold Accent (Brushed Gold)
| Token | Hex | Uso |
|-------|-----|-----|
| `--gold-primary` | `#d4af37` | Acentos principales, CTAs |
| `--gold-light` | `#f6d57a` | Glows cálidos, highlights |
| `--gold-dark` | `#b8860b` | Sombras doradas |
| `--gold-glow` | `rgba(212,175,55,0.15)` | Glow sutil |
| `--gold-glow-hover` | `rgba(212,175,55,0.25)` | Glow en hover |
| `--gold-glow-intense` | `rgba(246,213,122,0.35)` | Glow para CTAs |

### Text Colors
| Token | Clase | Uso |
|-------|-------|-----|
| `#ffffff` | `text-white` | Texto principal |
| `#a1a1aa` | `text-zinc-400` | Texto secundario |
| `#71717a` | `text-zinc-500` | Texto terciario |
| `#52525b` | `text-zinc-600` | Placeholders |
| `#3f3f46` | `text-zinc-700` | Texto deshabilitado |

### Rarity Colors
| Rarity | Color | Glow |
|--------|-------|------|
| COMMON | `#71717a` | Ninguno |
| RARE | `#3b82f6` | `rgba(59,130,246,0.3)` |
| EPIC | `#a855f7` | `rgba(168,85,247,0.3)` |
| LEGENDARY | `#d4af37` | `rgba(212,175,55,0.4)` |

---

## 🔤 Tipografía

### Sistema de Fuentes
```
Display/Títulos: Montserrat (Black, Uppercase)
Body/UI:         Inter (Regular a Bold)
Monospace:       JetBrains Mono / System mono
```

### Clases de Texto
| Elemento | Clases |
|----------|--------|
| **Logo** | `font-display font-black text-xl md:text-2xl uppercase tracking-wider` |
| **H1 Hero** | `font-display font-black text-4xl md:text-6xl lg:text-7xl uppercase tracking-tight` |
| **H2 Section** | `font-display font-bold text-2xl md:text-3xl uppercase tracking-wide` |
| **H3 Card** | `font-display font-bold text-lg uppercase` |
| **Body** | `text-sm md:text-base text-zinc-400` |
| **Label** | `text-xs font-medium uppercase tracking-widest text-zinc-500` |
| **Price** | `font-mono font-bold text-gold` |
| **CTA** | `font-display font-black text-xl md:text-2xl uppercase tracking-wide` |

---

## 🔘 Botones

### Primary (Gold Neon Border)
```jsx
<button className="
  relative px-8 py-4 
  bg-transparent 
  border border-gold/50
  text-gold font-display font-black uppercase tracking-wide
  rounded-lg
  shadow-[0_0_20px_rgba(212,175,55,0.15),inset_0_0_20px_rgba(212,175,55,0.05)]
  hover:shadow-[0_0_30px_rgba(212,175,55,0.3),inset_0_0_30px_rgba(212,175,55,0.1)]
  hover:border-gold
  transition-all duration-300
">
  ABRIR CAJA
</button>
```

### Primary Filled (Para CTAs principales)
```jsx
<button className="
  px-8 py-4 
  bg-gradient-to-b from-gold to-gold-dark
  text-black font-display font-black uppercase tracking-wide
  rounded-lg
  shadow-[0_0_30px_rgba(212,175,55,0.3)]
  hover:shadow-[0_0_50px_rgba(212,175,55,0.5)]
  hover:from-gold-light hover:to-gold
  transition-all duration-300
">
  ABRIR CAJA
</button>
```

### Secondary (Ghost)
```jsx
<button className="
  px-6 py-3
  bg-transparent
  border border-zinc-800
  text-zinc-400 font-medium
  rounded-lg
  hover:border-zinc-600 hover:text-white
  transition-all duration-300
">
  Cancelar
</button>
```

### Icon Button
```jsx
<button className="
  w-10 h-10
  bg-matte border border-zinc-800
  text-zinc-500
  rounded-lg
  hover:border-gold/30 hover:text-gold
  transition-all duration-300
  flex items-center justify-center
">
  <Icon />
</button>
```

---

## 📦 Cards

### Premium Box Card
```jsx
<div className="
  group relative
  bg-gradient-to-b from-surface to-matte
  border border-zinc-800/50
  rounded-2xl overflow-hidden
  hover:border-gold/30
  transition-all duration-500
  shadow-[0_10px_40px_rgba(0,0,0,0.5)]
  hover:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(212,175,55,0.1)]
">
  {/* Gold rim light effect */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
  </div>
  
  {/* Content */}
</div>
```

### Glass Panel
```jsx
<div className="
  bg-black/40 backdrop-blur-xl
  border border-white/5
  rounded-2xl
  shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
">
  {/* Content */}
</div>
```

---

## ✨ Efectos

### Gold Glow (Sutil)
```css
shadow-[0_0_20px_rgba(212,175,55,0.15)]
```

### Gold Glow (Hover)
```css
shadow-[0_0_40px_rgba(212,175,55,0.25)]
```

### Gold Rim Light (Bordes iluminados)
```css
/* Top edge */
bg-gradient-to-r from-transparent via-gold/40 to-transparent

/* Side edge */
bg-gradient-to-b from-transparent via-gold/20 to-transparent
```

### Cinematic Shadow
```css
shadow-[0_20px_60px_rgba(0,0,0,0.8)]
```

### Noise Texture (Background)
```css
/* Aplicar via pseudo-elemento */
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
opacity: 0.03;
```

### Wave Pattern (Decorativo)
```jsx
<svg className="absolute opacity-10" viewBox="0 0 200 200">
  <path 
    d="M0,100 Q50,50 100,100 T200,100" 
    fill="none" 
    stroke="url(#goldGradient)" 
    strokeWidth="1"
  />
</svg>
```

---

## 🎬 Animaciones (Framer Motion)

### Fade In Up
```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, ease: "easeOut" }}
```

### Scale In
```jsx
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.3, ease: "easeOut" }}
```

### Glow Pulse
```jsx
animate={{ 
  boxShadow: [
    "0 0 20px rgba(212,175,55,0.2)",
    "0 0 40px rgba(212,175,55,0.4)",
    "0 0 20px rgba(212,175,55,0.2)"
  ]
}}
transition={{ duration: 2, repeat: Infinity }}
```

### Stagger Children
```jsx
// Parent
variants={{
  show: { transition: { staggerChildren: 0.1 } }
}}

// Child
variants={{
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}}
```

---

## 📐 Spacing & Layout

### Container
```jsx
<div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
```

### Section Spacing
```jsx
<section className="py-16 md:py-24">
```

### Card Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

### Center-weighted Layout
```jsx
<div className="flex flex-col items-center text-center">
```

---

## 🧭 Navigation

### Bottom Nav (Mobile)
```jsx
<nav className="
  fixed bottom-0 inset-x-0 z-50
  bg-black/80 backdrop-blur-xl
  border-t border-zinc-800/50
  px-4 py-2
  flex justify-around items-center
  safe-area-pb
">
```

### Navbar (Desktop)
```jsx
<header className="
  fixed top-0 inset-x-0 z-50
  bg-black/60 backdrop-blur-xl
  border-b border-zinc-800/30
">
```

---

## 🌐 Idioma

- UI en **Español (México)**
- Términos gaming:
  - "Abrir" (no "Open")
  - "Caja" (no "Box")
  - "Premios" (no "Prizes")
  - "Mi Cartera" (no "Wallet")
  - "Recompensas" (no "Rewards")

---

## ✅ Checklist de Componentes

1. [ ] Usa colores del sistema (gold accent, blacks)
2. [ ] Tipografía Montserrat para títulos
3. [ ] Bordes con glow dorado en hover
4. [ ] Sombras cinematográficas profundas
5. [ ] Transiciones suaves (300-500ms)
6. [ ] Textura de ruido en fondos
7. [ ] Responsive (mobile-first)
8. [ ] Textos en español

---

*LOOTEA Design System V2 - Diciembre 2024*
