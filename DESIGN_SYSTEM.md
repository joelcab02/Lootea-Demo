# Lootea Design System

> **IMPORTANTE**: Consultar este archivo antes de crear cualquier componente nuevo.

---

## 🎨 Colores

### Primarios (Premium Gold Palette)
| Nombre | Hex | Uso |
|--------|-----|-----|
| **Gold Primary** | `#F7C948` | Botones principales, acentos, wallet, CTAs |
| **Gold Light** | `#FFD966` | Highlights, hover states |
| **Gold Dark** | `#D4A520` | Sombras, bordes |
| **Gold Shadow** | `#B8860B` | Deep shadows (DarkGoldenrod) |
| **Gold Glow** | `rgba(247,201,72,0.25)` | Sombras y glows (SUTIL) |
| **Gold Glow Hover** | `rgba(247,201,72,0.35)` | Hover glow |

> **NOTA**: Los glows deben ser SUTILES (20-35% opacidad). Evitar el estilo "Photoshop 2015".

### Fondos
| Nombre | Hex | Uso |
|--------|-----|-----|
| **Background** | `#0d1019` | Fondo principal de la app |
| **Surface** | `#1a1d26` | Cards, modales, inputs |
| **Surface Hover** | `#252830` | Hover en surfaces |
| **Border** | `#1e2330` | Bordes sutiles |
| **Border Light** | `#2a2d36` | Bordes más visibles |

### Texto
| Nombre | Hex | Uso |
|--------|-----|-----|
| **White** | `#ffffff` | Texto principal |
| **Slate 300** | `text-slate-300` | Texto secundario |
| **Slate 400** | `text-slate-400` | Texto terciario, labels |
| **Slate 500** | `text-slate-500` | Texto deshabilitado |
| **Slate 600** | `text-slate-600` | Placeholders |

### Estados
| Nombre | Hex | Uso |
|--------|-----|-----|
| **Success** | `#22c55e` (green-500) | Éxito, verificado |
| **Error** | `#ef4444` (red-400) | Errores |
| **Error BG** | `rgba(239,68,68,0.1)` | Fondo de alertas error |

### Raridades (Items)
| Rarity | Color | Glow |
|--------|-------|------|
| **COMMON** | `#9ca3af` | Ninguno |
| **RARE** | `#3b82f6` | Azul suave |
| **EPIC** | `#a855f7` | Púrpura |
| **LEGENDARY** | `#F7C948` | Dorado premium |

---

## 🔤 Tipografía

### Sistema de Fuentes
```
Display/Títulos: Montserrat (Black, Italic opcional)
Body/UI:         Inter (Regular a Bold)
Monospace:       System mono (para precios)
```

### Clases CSS
| Clase | Uso |
|-------|-----|
| `font-display` | Títulos, CTAs, branding (Montserrat) |
| `font-gamer` | Alias de font-display (legacy) |
| Sin clase | Body text (Inter por defecto) |
| `font-mono` | Precios, números |

### Estilos de Texto

| Elemento | Clases Tailwind |
|----------|-----------------|
| **Logo** | `font-display font-black text-2xl md:text-3xl` |
| **Títulos H1** | `font-display font-black text-4xl md:text-6xl italic` |
| **Títulos H2** | `text-2xl md:text-3xl font-bold` |
| **Subtítulos** | `text-slate-500 text-sm` |
| **Botones CTA** | `font-display font-black text-2xl italic uppercase` |
| **Botones secundarios** | `text-sm font-medium` o `font-bold` |
| **Labels** | `text-xs font-medium uppercase tracking-wide` |
| **Body** | `text-sm` o `text-base` (Inter automático) |
| **Precios** | `font-mono font-bold` |

### Ejemplos
```html
<!-- Logo -->
<span class="font-display font-black text-2xl md:text-3xl text-white">
  LOOTEA
</span>

<!-- Título principal -->
<h1 class="font-display font-black text-4xl md:text-6xl italic text-white">
  1% iPHONE BOX
</h1>

<!-- Título de sección -->
<h2 class="text-2xl md:text-3xl font-bold text-white">
  Contenido de la Caja
</h2>

<!-- Botón CTA -->
<button class="font-display font-black text-2xl italic uppercase">
  ABRIR
</button>

<!-- Precio -->
<span class="font-mono font-bold text-[#FFC800]">
  $99.00
</span>
```

---

## 🔘 Botones

### Botón Primario (Dorado)
```html
<button class="bg-[#FFC800] hover:bg-[#FFD700] text-black font-gamer font-black italic py-3 px-4 rounded-lg uppercase tracking-tight shadow-[0_0_20px_rgba(255,200,0,0.2)] hover:shadow-[0_0_30px_rgba(255,200,0,0.4)] transition-all">
  CREAR CUENTA
</button>
```

### Botón Secundario (Ghost)
```html
<button class="text-slate-400 hover:text-white font-gamer font-bold italic uppercase tracking-tight transition-colors">
  Entrar
</button>
```

### Botón con Borde
```html
<button class="bg-[#1a1d26] hover:bg-[#252830] border border-[#2a2d36] hover:border-[#FFC800]/30 text-slate-300 py-3 px-4 rounded-lg transition-all">
  Continuar con Google
</button>
```

---

## 📦 Cards y Contenedores

### Modal
```html
<div class="bg-[#0d1019] border border-[#1e2330] rounded-2xl overflow-hidden shadow-2xl">
  <!-- Gold accent line -->
  <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFC800] to-transparent"></div>
  
  <div class="p-8">
    <!-- Content -->
  </div>
</div>
```

### Card Surface
```html
<div class="bg-[#1a1d26] border border-[#2a2d36] rounded-lg p-4">
  <!-- Content -->
</div>
```

### Backdrop (para modales)
```html
<div class="fixed inset-0 bg-black/80 backdrop-blur-sm"></div>
```

---

## 📝 Inputs

### Input de Texto
```html
<input 
  class="w-full bg-[#1a1d26] border border-[#2a2d36] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#FFC800] transition-colors placeholder-slate-600"
  placeholder="tu@email.com"
/>
```

### Label
```html
<label class="block text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
  Email
</label>
```

### Checkbox
```html
<input 
  type="checkbox"
  class="w-4 h-4 rounded border-[#2a2d36] bg-[#1a1d26] text-[#FFC800] focus:ring-[#FFC800] accent-[#FFC800]"
/>
```

---

## ✨ Efectos y Animaciones

### Glow Dorado
```css
shadow-[0_0_20px_rgba(255,200,0,0.2)]
hover:shadow-[0_0_30px_rgba(255,200,0,0.4)]
```

### Drop Shadow para Logo
```css
filter drop-shadow-[0_0_10px_rgba(255,200,0,0.5)]
```

### Transiciones
```css
transition-all
transition-colors
```

### Hover en elementos interactivos
- Siempre usar `transition-all` o `transition-colors`
- Cambiar borde a `border-[#FFC800]/30` en hover
- Aumentar brillo con `hover:brightness-110`

---

## 💰 Wallet (Balance)

```html
<div class="flex items-center bg-[#FFC800] rounded-lg text-black pl-2.5 pr-1.5 py-1.5 gap-1 shadow-[0_0_10px_rgba(255,200,0,0.15)] hover:shadow-[0_0_20px_rgba(255,200,0,0.3)] transition-all cursor-pointer group hover:brightness-110">
  <span class="font-mono font-black text-xs tracking-tighter">
    $2,450
  </span>
  <div class="w-5 h-5 bg-black/10 rounded flex items-center justify-center group-hover:bg-black/20 transition-colors">
    <!-- Plus icon -->
  </div>
</div>
```

---

## 🎯 Iconos

- Usar SVG inline para control total
- Stroke width: `2` para iconos de línea
- Fill: `currentColor` o color específico
- Tamaños comunes: `16`, `18`, `20`, `24`

---

## 📱 Responsive

### Breakpoints
- Mobile: default
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)

### Patrón común
```html
<div class="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm">
```

---

## 🌐 Idioma

- UI en **Español** (México)
- Usar términos gaming cuando aplique
- Ejemplos:
  - "Entrar" (no "Sign In")
  - "Registro" (no "Register")
  - "Crear Cuenta"
  - "Cerrar Sesión"
  - "Mi Inventario"

---

## ✅ Checklist para Nuevos Componentes

1. [ ] ¿Usa los colores del sistema? (Gold, backgrounds)
2. [ ] ¿Usa `font-gamer` para títulos y CTAs?
3. [ ] ¿Tiene transiciones suaves?
4. [ ] ¿El hover tiene efecto visual?
5. [ ] ¿Es responsive (mobile-first)?
6. [ ] ¿Los textos están en español?
7. [ ] ¿Los inputs tienen focus state dorado?
8. [ ] ¿Los modales tienen la línea dorada superior?

---

*Última actualización: Noviembre 2025*
