# Guía de Migración a Zustand Store

## ✅ Estado Actual: MIGRACIÓN COMPLETADA

La migración principal está completa. El proyecto ahora usa Zustand para el estado del juego.

## Archivos Creados/Modificados

```
stores/
├── useGameStore.ts   # Store principal del juego (290 líneas)
└── index.ts          # Re-exports

Modificados:
├── App.tsx                    # ✅ Migrado a Zustand
├── components/box/Spinner.tsx # ✅ Híbrido (store + props)
├── hooks/useBox.ts            # ✅ Migrado a Zustand
├── services/supabaseClient.ts # ✅ Variables de entorno
└── services/oddsStore.ts      # ⚠️ Marcado como @deprecated
```

## Cambios Realizados

### 1. Variables de Entorno (✅ Completado)

```typescript
// services/supabaseClient.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

**Archivo `.env` requerido:**
```
VITE_SUPABASE_URL=https://tmikqlakdnkjhdbhkjru.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu_key...
```

### 2. Zustand Store (✅ Completado)

El store maneja:
- `phase`: 'idle' | 'spinning' | 'result'
- `mode`: 'demo' | 'real'
- `currentBox`, `items`
- `predeterminedWinner` (servidor)
- `lastWinner` (resultado final)
- `balance`, `error`
- **Anti doble-click automático**
- **DevTools para debugging**

### 3. App.tsx (✅ Migrado)

- Eliminados ~15 useState
- Lógica de juego movida al store
- handleSpin simplificado

### 4. Spinner.tsx (✅ Híbrido)

El Spinner ahora puede:
- Leer directamente del store (por defecto)
- Recibir props (para compatibilidad)

```tsx
// Uso simple - lee del store
<Spinner customDuration={5500} onSpinEnd={handleEffects} />

// Uso con props (legacy)
<Spinner items={items} isSpinning={true} useStore={false} />
```

### 5. useBox Hook (✅ Migrado)

Ahora usa el store en lugar de oddsStore legacy.

### 6. oddsStore.ts (⚠️ Deprecated)

Marcado como `@deprecated`. Se mantiene solo para:
- AdminDashboard (pendiente de migrar)
- Funciones de admin

---

## Migración de App.tsx (Referencia)

### Paso 1: Importar el store (sin cambiar nada más)

```typescript
// App.tsx - Agregar al inicio
import { useGameStore, selectIsSpinning, selectShowResult } from './stores';
```

### Paso 2: Reemplazar estados uno por uno

```typescript
// ANTES
const [isSpinning, setIsSpinning] = useState(false);
const [winner, setWinner] = useState<LootItem | null>(null);
const [showResult, setShowResult] = useState(false);
const [demoMode, setDemoMode] = useState(true);
const [serverWinner, setServerWinner] = useState<LootItem | null>(null);
const [currentBox, setCurrentBox] = useState<Box | null>(null);
const [gameError, setGameError] = useState<string | null>(null);

// DESPUÉS
const phase = useGameStore(state => state.phase);
const isSpinning = phase === 'spinning';
const showResult = phase === 'result';
const mode = useGameStore(state => state.mode);
const demoMode = mode === 'demo';
const lastWinner = useGameStore(state => state.lastWinner);
const predeterminedWinner = useGameStore(state => state.predeterminedWinner);
const currentBox = useGameStore(state => state.currentBox);
const gameError = useGameStore(state => state.error);
const items = useGameStore(state => state.items);

// Acciones
const { startSpin, onSpinComplete, closeResult, setMode, loadDefaultBox, clearError } = useGameStore();
```

### Paso 3: Simplificar handleSpin

```typescript
// ANTES: ~60 líneas de lógica
const handleSpin = async () => {
  if (isSpinning || isLoading) return;
  // ... mucha lógica ...
};

// DESPUÉS: 1 línea
const handleSpin = () => startSpin();
```

### Paso 4: Simplificar handleSpinEnd

```typescript
// ANTES
const handleSpinEnd = (item: LootItem) => {
  setIsSpinning(false);
  setWinner(item);
  setShowResult(true);
  triggerWinEffects(item);
  if (!demoMode && isLoggedIn()) {
    fetchInventory();
    refreshBalance();
  }
};

// DESPUÉS
const handleSpinEnd = (item: LootItem) => {
  onSpinComplete(item);  // El store maneja todo
  triggerWinEffects(item);
};
```

### Paso 5: Simplificar inicialización

```typescript
// ANTES
useEffect(() => {
  initializeStore();
  initAuth();
  getBoxes().then(boxes => {
    if (boxes.length > 0) {
      setCurrentBox(boxes[0]);
    }
  });
  // ...
}, []);

// DESPUÉS
useEffect(() => {
  initAuth();
  loadDefaultBox();  // El store carga la caja
}, []);
```

---

## Integración con Spinner

El Spinner puede obtener datos directamente del store:

```typescript
// components/box/Spinner.tsx

import { useGameStore } from '../../stores';

const Spinner: React.FC<SpinnerProps> = ({ items }) => {
  // Obtener del store
  const isSpinning = useGameStore(state => state.phase === 'spinning');
  const predeterminedWinner = useGameStore(state => state.predeterminedWinner);
  const onSpinComplete = useGameStore(state => state.onSpinComplete);
  
  // ... resto igual, pero usando onSpinComplete del store
};
```

---

## Beneficios Después de Migrar

1. **App.tsx pasa de ~400 líneas a ~150**
2. **Lógica de negocio centralizada en el store**
3. **Anti doble-click automático**
4. **DevTools para debugging**
5. **Testing más fácil**

---

## Orden Recomendado

1. ✅ Variables de entorno
2. ✅ Crear store
3. ⏳ Conectar store a App.tsx (gradual)
4. ⏳ Conectar store a Spinner
5. ⏳ Eliminar oddsStore legacy
6. ⏳ Limpiar código no usado

---

## Verificar que Funciona

```bash
# Compilar sin errores
npx tsc --noEmit

# Servidor de desarrollo
npm run dev
```

Abre http://localhost:3000 y verifica que:
- La caja carga
- El spinner funciona en modo demo
- No hay errores en consola
