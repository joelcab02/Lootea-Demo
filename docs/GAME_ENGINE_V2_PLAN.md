# 🎰 LOOTEA GAME ENGINE v2.0
## Plan de Implementación y Resumen Ejecutivo

**Fecha:** Diciembre 2025  
**Versión:** 2.0  
**Status:** Pendiente de Implementación  
**Supabase Project:** `tmikqlakdnkjhdbhkjru`

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Estado Actual del Sistema](#2-estado-actual-del-sistema)
3. [Problemas Identificados](#3-problemas-identificados)
4. [Arquitectura del Game Engine](#4-arquitectura-del-game-engine)
5. [Modelo Matemático](#5-modelo-matemático)
6. [Sistema de Tiers](#6-sistema-de-tiers)
7. [Risk Engine](#7-risk-engine)
8. [Plan de Implementación](#8-plan-de-implementación)
9. [Migraciones SQL](#9-migraciones-sql)
10. [Código TypeScript](#10-código-typescript)
11. [Métricas y KPIs](#11-métricas-y-kpis)
12. [Checklist de Implementación](#12-checklist-de-implementación)

---

## 1. RESUMEN EJECUTIVO

### ¿Qué es el Game Engine?

El Game Engine es el **cerebro del backend** de Lootea. No es la UI ni el frontend. Es un servicio que:

1. **Recibe**: user_id, box_id
2. **Valida**: saldo, sesión, estado del juego
3. **Calcula**: qué premio sale (RNG + probabilidades + EV)
4. **Verifica**: si el premio es aceptable según riesgo
5. **Registra**: todo en la base de datos
6. **Responde**: premio + datos para animación

### ¿Por qué es necesario?

```
ANTES (Sistema Actual):
├── Odds configurados por item individual
├── Sin separación costo real vs valor display
├── Sin control de riesgo
├── EV desconocido
└── RESULTADO: iPhone $40k con 15% probabilidad = QUIEBRA

DESPUÉS (Game Engine v2):
├── Sistema de Tiers con probabilidades controladas
├── Separación clara de costos
├── Risk Engine con límites automáticos
├── EV calculado y validado
└── RESULTADO: Margen garantizado del 60-65%
```

### Números Clave

| Métrica | Target |
|---------|--------|
| RTP (Return to Player) | 35-40% |
| House Edge | 60-65% |
| Max Loss Diario | $50,000 MXN |
| Max Rares por Día | 20 por caja |

---

## 2. ESTADO ACTUAL DEL SISTEMA

### Tablas Existentes ✅

| Tabla | Descripción | Status |
|-------|-------------|--------|
| `boxes` | Cajas disponibles | ✅ OK |
| `items` | Premios | ⚠️ Falta value_cost |
| `box_items` | Relación caja-items con odds | ✅ OK |
| `profiles` | Perfiles de usuario | ✅ OK |
| `wallets` | Saldos (con constraint >=0) | ✅ OK |
| `user_seeds` | Seeds para provably fair | ✅ OK |
| `spins` | Historial de aperturas | ⚠️ Falta profit |
| `inventory` | Items ganados | ✅ OK |
| `transactions` | Movimientos de dinero | ✅ OK |
| `withdrawals` | Retiros físicos | ✅ OK |
| `odds_history` | Auditoría de cambios | ✅ OK |

### RPCs Existentes ✅

```sql
open_box(box_id)           -- Abre caja (a reemplazar)
get_user_inventory()       -- Obtiene inventario
sell_inventory_item(id)    -- Vende un item
sell_all_inventory()       -- Vende todo
get_inventory_count()      -- Cuenta items
handle_new_user()          -- Trigger de signup
is_admin()                 -- Verifica admin
```

### Constraints Importantes ✅

```sql
wallets_balance_check: (balance >= 0)           -- ✅ YA EXISTE
items_price_check: (price >= 0)                 -- ✅ YA EXISTE
spins_ticket_number_check: (1 <= ticket <= 1M)  -- ✅ YA EXISTE
```

---

## 3. PROBLEMAS IDENTIFICADOS

### 🚨 CRÍTICO: Odds Mal Configurados

**Apple 2025 Box** (Precio: $99 MXN):

| Item | Precio | Odds | EV Contribución |
|------|--------|------|-----------------|
| 🚨 iPhone 17 Pro Max | $40,999 | 15.0% | **$6,150** |
| Funda Transparente | $100 | 15.0% | $15 |
| Sticker Apple | $50 | 15.0% | $7.50 |
| ... | ... | ... | ... |
| **TOTAL EV** | | | **~$6,940** |

**Resultado:**
- EV / Precio = $6,940 / $99 = **70x el precio de la caja**
- House Edge = **-6,941%** (PÉRDIDA MASIVA)
- 1 de cada 7 aperturas gana un iPhone de $41,000

### ⚠️ Otros Problemas

1. **Sin sistema de Tiers**: Los odds van directo a items
2. **Sin value_cost**: No sabemos el costo real de cada premio
3. **Sin Risk Engine**: No hay límites de pérdida
4. **Sin profit tracking**: No sabemos cuánto ganamos por spin
5. **Sin idempotencia**: Posible doble-cobro en fallos de red

---

## 4. ARQUITECTURA DEL GAME ENGINE

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                      │
│  ┌─────────────┐                                                    │
│  │ BoxPage.tsx │ ──► play(boxId) ──► gameEngineService.ts          │
│  └─────────────┘         │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SUPABASE RPC                                     │
│                                                                      │
│  game_engine_play(box_id, request_id)                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 1. Auth Check          ─► NOT_AUTHENTICATED?                 │   │
│  │ 2. Idempotency Check   ─► Return existing result?           │   │
│  │ 3. Load Box Config     ─► BOX_NOT_FOUND?                    │   │
│  │ 4. Lock & Check Balance ─► INSUFFICIENT_FUNDS?              │   │
│  │ 5. Create Pending Spin                                       │   │
│  │ 6. Debit Balance                                             │   │
│  │ 7. Generate RNG (Provably Fair)                              │   │
│  │ 8. Select Tier by Probability                                │   │
│  │ 9. Risk Engine Check    ─► Downgrade if needed              │   │
│  │ 10. Select Prize in Tier                                     │   │
│  │ 11. Calculate Profit                                         │   │
│  │ 12. Update Spin to Committed                                 │   │
│  │ 13. Add to Inventory                                         │   │
│  │ 14. Record Transaction                                       │   │
│  │ 15. Update Risk State                                        │   │
│  │ 16. Return Result                                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL                                      │
│  wallets ─► spins ─► inventory ─► transactions ─► risk_state        │
└─────────────────────────────────────────────────────────────────────┘
```

### Nuevas Tablas Requeridas

| Tabla | Propósito |
|-------|-----------|
| `prize_tiers` | Niveles de premio por caja |
| `risk_state` | Tracking de riesgo por período |
| `risk_events` | Log de intervenciones del Risk Engine |

### Columnas Nuevas en Tablas Existentes

```sql
-- items
ALTER TABLE items ADD COLUMN value_cost NUMERIC(10,2);
ALTER TABLE items ADD COLUMN tier_id UUID;
ALTER TABLE items ADD COLUMN weight INTEGER DEFAULT 100;
ALTER TABLE items ADD COLUMN stock INTEGER DEFAULT -1;

-- boxes
ALTER TABLE boxes ADD COLUMN target_rtp NUMERIC(5,4) DEFAULT 0.35;
ALTER TABLE boxes ADD COLUMN max_daily_loss NUMERIC(12,2) DEFAULT 50000;
ALTER TABLE boxes ADD COLUMN max_rare_per_day INTEGER DEFAULT 20;

-- spins
ALTER TABLE spins ADD COLUMN tier_id UUID;
ALTER TABLE spins ADD COLUMN profit_margin NUMERIC(10,2);
ALTER TABLE spins ADD COLUMN payout_cost NUMERIC(10,2);
ALTER TABLE spins ADD COLUMN was_downgraded BOOLEAN DEFAULT false;
ALTER TABLE spins ADD COLUMN request_id TEXT UNIQUE;
ALTER TABLE spins ADD COLUMN status round_status DEFAULT 'committed';
```

---

## 5. MODELO MATEMÁTICO

### Fórmulas Clave

```
P     = Precio de la caja
C_i   = Costo real del premio i (value_cost)
D_i   = Valor display del premio i (price)
p_i   = Probabilidad del premio i

EV_cost    = Σ (C_i × p_i)     ← Lo que te cuesta en promedio
EV_display = Σ (D_i × p_i)     ← Lo que el usuario "percibe"

House_Edge = (P - EV_cost) / P
RTP        = EV_cost / P
Profit     = P - EV_cost
```

### Ejemplo: Caja Bien Configurada

```
APPLE BOX - CONFIGURACIÓN CORRECTA
Precio: $99 MXN

┌─────────────┬──────────┬──────────┬──────────┬─────────────┐
│ Tier        │ Prob     │ Avg Cost │ EV       │ % del Total │
├─────────────┼──────────┼──────────┼──────────┼─────────────┤
│ Común       │ 85.0%    │ $8       │ $6.80    │ 19%         │
│ Premium     │ 12.0%    │ $80      │ $9.60    │ 26%         │
│ Épico       │ 2.5%     │ $400     │ $10.00   │ 27%         │
│ Legendario  │ 0.5%     │ $2,000   │ $10.00   │ 27%         │
├─────────────┼──────────┼──────────┼──────────┼─────────────┤
│ TOTAL       │ 100%     │          │ $36.40   │ 100%        │
└─────────────┴──────────┴──────────┴──────────┴─────────────┘

Métricas:
• EV Cost:     $36.40 (36.8% del precio)
• House Edge:  63.2%
• Profit/Caja: $62.60
```

---

## 6. SISTEMA DE TIERS

### Estructura de Tiers

```sql
CREATE TABLE prize_tiers (
  id UUID PRIMARY KEY,
  box_id UUID REFERENCES boxes(id),
  tier tier_name NOT NULL,              -- 'common', 'mid', 'rare', 'jackpot'
  display_name TEXT NOT NULL,           -- "Común", "Premium", etc.
  base_probability NUMERIC(10,8) NOT NULL,
  min_cost NUMERIC(10,2),
  max_cost NUMERIC(10,2),
  requires_risk_check BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  color_hex TEXT DEFAULT '#888888'
);
```

### Configuración Recomendada

| Tier | Probabilidad | Costo Rango | Risk Check | Color |
|------|--------------|-------------|------------|-------|
| Common | 85.0% | $5 - $50 | No | #9CA3AF |
| Mid | 12.0% | $50 - $500 | No | #3B82F6 |
| Rare | 2.5% | $500 - $5,000 | Sí | #A855F7 |
| Jackpot | 0.5% | $5,000+ | Sí | #F59E0B |

### Selección de Premio (2 pasos)

```
Paso 1: Seleccionar TIER
─────────────────────────
ticket = 0.73 (73%)
cumulative = 0
for tier in [common, mid, rare, jackpot]:
    cumulative += tier.probability
    if ticket <= cumulative:
        selected_tier = tier  ← common (0.73 <= 0.85)
        break

Paso 2: Seleccionar PREMIO dentro del tier
──────────────────────────────────────────
prizes_in_tier = [Sticker(w=100), Funda(w=80), Cable(w=50)]
total_weight = 230
weighted_random → Sticker
```

---

## 7. RISK ENGINE

### Propósito

El Risk Engine protege contra:
- Streaks de suerte extrema
- Explotación de bugs
- Pérdidas catastróficas

### Reglas de Riesgo

```python
# Pseudocódigo del Risk Engine

def check_risk(theoretical_tier, risk_state, box_config):
    final_tier = theoretical_tier
    
    # Regla 1: Límite de pérdida diaria
    if risk_state.gross_profit < -box_config.max_daily_loss:
        final_tier = downgrade_to('common')
        log_event('Daily loss limit exceeded')
    
    # Regla 2: Máximo de rares por día
    elif theoretical_tier in ['rare', 'jackpot']:
        if risk_state.rare_count >= box_config.max_rare_per_day:
            final_tier = downgrade_to('mid')
            log_event('Max rares per day reached')
    
    # Regla 3: Máximo de jackpots por semana
    elif theoretical_tier == 'jackpot':
        if weekly_jackpot_count >= box_config.max_jackpot_per_week:
            final_tier = downgrade_to('rare')
            log_event('Max jackpots per week reached')
    
    return final_tier
```

### Tabla risk_state

```sql
CREATE TABLE risk_state (
  id UUID PRIMARY KEY,
  box_id UUID REFERENCES boxes(id),
  period_type TEXT NOT NULL,        -- 'daily', 'weekly'
  period_start DATE NOT NULL,
  
  total_rounds INTEGER DEFAULT 0,
  total_bets NUMERIC(14,2) DEFAULT 0,
  total_payouts_cost NUMERIC(14,2) DEFAULT 0,
  gross_profit NUMERIC(14,2) DEFAULT 0,
  
  common_count INTEGER DEFAULT 0,
  mid_count INTEGER DEFAULT 0,
  rare_count INTEGER DEFAULT 0,
  jackpot_count INTEGER DEFAULT 0,
  
  actual_rtp NUMERIC(6,4),
  
  UNIQUE(box_id, period_type, period_start)
);
```

---

## 8. PLAN DE IMPLEMENTACIÓN

### Fases

```
FASE 0: URGENTE (Hoy)
═════════════════════
□ Desactivar cajas mal configuradas
□ Verificar EV de todas las cajas activas

FASE 1: Schema (Día 1-2)
════════════════════════
□ Ejecutar migration 009_game_engine_tables.sql
□ Crear prize_tiers para cada box
□ Actualizar items con value_cost y tier_id

FASE 2: Game Engine RPC (Día 3-4)
═════════════════════════════════
□ Ejecutar migration 010_game_engine_rpc.sql
□ Probar game_engine_play en SQL Editor
□ Verificar idempotencia

FASE 3: Frontend Integration (Día 5)
════════════════════════════════════
□ Crear gameEngineService.ts
□ Actualizar BoxPage.tsx
□ Probar flujo completo

FASE 4: Migración de Datos (Día 6)
══════════════════════════════════
□ Ejecutar migration 011_migrate_existing_data.sql
□ Validar todas las cajas con validate_box_config()
□ Activar cajas válidas

FASE 5: Monitoreo (Día 7+)
══════════════════════════
□ Crear dashboard de risk_state
□ Configurar alertas
□ Documentar procedimientos
```

### Archivos a Crear

```
supabase/migrations/
├── 009_game_engine_tables.sql
├── 010_game_engine_rpc.sql
└── 011_migrate_existing_data.sql

services/
└── gameEngineService.ts

core/types/
└── game-engine.types.ts
```

---

## 9. MIGRACIONES SQL

### 009_game_engine_tables.sql

```sql
-- Ver archivo completo en supabase/migrations/
-- Contenido principal:

-- 1. Crear enum tier_name
CREATE TYPE tier_name AS ENUM ('common', 'mid', 'rare', 'jackpot');
CREATE TYPE round_status AS ENUM ('pending', 'committed', 'failed', 'refunded');

-- 2. Crear prize_tiers
CREATE TABLE prize_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
  tier tier_name NOT NULL,
  display_name TEXT NOT NULL,
  base_probability NUMERIC(10,8) NOT NULL,
  min_cost NUMERIC(10,2) DEFAULT 0,
  max_cost NUMERIC(10,2) DEFAULT 999999,
  avg_cost NUMERIC(10,2),
  requires_risk_check BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  color_hex TEXT DEFAULT '#888888',
  UNIQUE(box_id, tier)
);

-- 3. Agregar columnas a items
ALTER TABLE items ADD COLUMN IF NOT EXISTS value_cost NUMERIC(10,2);
ALTER TABLE items ADD COLUMN IF NOT EXISTS tier_id UUID REFERENCES prize_tiers(id);
ALTER TABLE items ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 100;
ALTER TABLE items ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT -1;

-- 4. Agregar columnas a boxes
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS target_rtp NUMERIC(5,4) DEFAULT 0.35;
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS max_daily_loss NUMERIC(12,2) DEFAULT 50000;
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS max_rare_per_day INTEGER DEFAULT 20;

-- 5. Agregar columnas a spins
ALTER TABLE spins ADD COLUMN IF NOT EXISTS tier_id UUID;
ALTER TABLE spins ADD COLUMN IF NOT EXISTS profit_margin NUMERIC(10,2);
ALTER TABLE spins ADD COLUMN IF NOT EXISTS payout_cost NUMERIC(10,2);
ALTER TABLE spins ADD COLUMN IF NOT EXISTS was_downgraded BOOLEAN DEFAULT false;
ALTER TABLE spins ADD COLUMN IF NOT EXISTS request_id TEXT UNIQUE;
ALTER TABLE spins ADD COLUMN IF NOT EXISTS status round_status DEFAULT 'committed';

-- 6. Crear risk_state
CREATE TABLE risk_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES boxes(id),
  period_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  total_rounds INTEGER DEFAULT 0,
  total_bets NUMERIC(14,2) DEFAULT 0,
  total_payouts_cost NUMERIC(14,2) DEFAULT 0,
  gross_profit NUMERIC(14,2) DEFAULT 0,
  common_count INTEGER DEFAULT 0,
  mid_count INTEGER DEFAULT 0,
  rare_count INTEGER DEFAULT 0,
  jackpot_count INTEGER DEFAULT 0,
  actual_rtp NUMERIC(6,4),
  UNIQUE(box_id, period_type, period_start)
);

-- 7. Crear risk_events
CREATE TABLE risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spin_id UUID REFERENCES spins(id),
  box_id UUID NOT NULL REFERENCES boxes(id),
  event_type TEXT NOT NULL,
  original_tier tier_name,
  final_tier tier_name,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 010_game_engine_rpc.sql

```sql
-- Ver archivo completo en supabase/migrations/
-- Función principal: game_engine_play(box_id, request_id)
-- Incluye:
-- • Idempotencia con request_id
-- • Selección de tier por probabilidad
-- • Risk Engine con downgrades
-- • Profit tracking
-- • Transacciones atómicas
```

### 011_migrate_existing_data.sql

```sql
-- Migra datos existentes al nuevo sistema de tiers
-- 1. Crea tiers default para cada box
-- 2. Asigna items a tiers según rarity
-- 3. Calcula value_cost como 30% del price
-- 4. Valida todas las cajas
```

---

## 10. CÓDIGO TYPESCRIPT

### gameEngineService.ts

```typescript
// services/gameEngineService.ts

import { supabase, forceReconnect, testConnection } from './supabaseClient';
import { refreshWallet, isLoggedIn, getAuthState } from './authService';

interface GameEngineResult {
  success: boolean;
  error?: string;
  message?: string;
  round_id?: string;
  prize?: {
    id: string;
    name: string;
    value: number;
    rarity: string;
    image: string;
    tier: string;
  };
  ticket?: number;
  new_balance?: number;
  fairness?: {
    server_seed_hash: string;
    client_seed: string;
    nonce: number;
  };
}

export function canPlay(boxPrice: number): { canPlay: boolean; reason?: string } {
  if (!isLoggedIn()) {
    return { canPlay: false, reason: 'NOT_AUTHENTICATED' };
  }
  const balance = getAuthState().wallet?.balance ?? 0;
  if (balance < boxPrice) {
    return { canPlay: false, reason: 'INSUFFICIENT_FUNDS' };
  }
  return { canPlay: true };
}

export async function play(boxId: string): Promise<GameEngineResult> {
  const requestId = crypto.randomUUID();
  
  try {
    // Verify session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      const reconnected = await forceReconnect();
      if (!reconnected) {
        return { success: false, error: 'NOT_AUTHENTICATED', message: 'Sesión expirada' };
      }
    }
    
    // Call game engine
    const { data, error } = await supabase.rpc('game_engine_play', {
      p_box_id: boxId,
      p_request_id: requestId
    });
    
    if (error) {
      return { success: false, error: 'INTERNAL_ERROR', message: error.message };
    }
    
    const result = data as GameEngineResult;
    if (result.success) {
      await refreshWallet();
    }
    
    return result;
    
  } catch (err: any) {
    // On network error, retry with same requestId (idempotent)
    if (err?.name === 'AbortError') {
      return retryWithRequestId(boxId, requestId);
    }
    return { success: false, error: 'INTERNAL_ERROR', message: 'Error de conexión' };
  }
}

async function retryWithRequestId(boxId: string, requestId: string): Promise<GameEngineResult> {
  await new Promise(r => setTimeout(r, 1000));
  const { data, error } = await supabase.rpc('game_engine_play', {
    p_box_id: boxId,
    p_request_id: requestId
  });
  if (error) {
    return { success: false, error: 'RECOVERY_FAILED', message: 'Contacta soporte: ' + requestId };
  }
  return data as GameEngineResult;
}
```

---

## 11. MÉTRICAS Y KPIs

### Dashboard de Riesgo

```sql
-- Query para dashboard diario
SELECT 
  b.name as box_name,
  rs.period_start,
  rs.total_rounds,
  rs.total_bets,
  rs.total_payouts_cost,
  rs.gross_profit,
  ROUND((rs.actual_rtp * 100)::numeric, 2) as rtp_percent,
  rs.rare_count,
  rs.jackpot_count
FROM risk_state rs
JOIN boxes b ON b.id = rs.box_id
WHERE rs.period_type = 'daily'
ORDER BY rs.period_start DESC
LIMIT 30;
```

### KPIs Target

| Métrica | Target | Alerta |
|---------|--------|--------|
| RTP Diario | 35-40% | > 50% |
| House Edge | 60-65% | < 50% |
| Profit/Caja | $60+ | < $30 |
| Rares/Día | < 20 | > 15 |
| Jackpots/Semana | < 5 | > 3 |

### Proyección Financiera

```
1,000 cajas/día × $150 promedio = $150,000 revenue
$150,000 × 35% RTP = $52,500 costo premios
$150,000 - $52,500 = $97,500 gross profit diario

Mensual: $2,925,000 MXN (~$162,500 USD)
Anual: $35,100,000 MXN (~$1.95M USD)
```

---

## 12. CHECKLIST DE IMPLEMENTACIÓN

### Pre-Implementación
- [ ] Desactivar cajas con EV > precio
- [ ] Backup de base de datos
- [ ] Documentar odds actuales

### Fase 1: Schema
- [ ] Ejecutar 009_game_engine_tables.sql
- [ ] Verificar nuevas tablas creadas
- [ ] Verificar nuevas columnas en tables existentes

### Fase 2: Datos
- [ ] Crear prize_tiers para cada box
- [ ] Asignar items a tiers
- [ ] Calcular y asignar value_cost
- [ ] Validar con validate_box_config()

### Fase 3: Game Engine
- [ ] Ejecutar 010_game_engine_rpc.sql
- [ ] Probar game_engine_play manualmente
- [ ] Verificar idempotencia
- [ ] Verificar Risk Engine

### Fase 4: Frontend
- [ ] Crear gameEngineService.ts
- [ ] Actualizar BoxPage.tsx
- [ ] Probar flujo completo
- [ ] Probar recuperación de errores

### Fase 5: Go-Live
- [ ] Activar cajas validadas
- [ ] Monitorear risk_state
- [ ] Configurar alertas
- [ ] Documentar runbook

---

## CONTACTO Y REFERENCIAS

- **Supabase Dashboard**: https://supabase.com/dashboard/project/tmikqlakdnkjhdbhkjru
- **Proyecto**: Lootea V1
- **Región**: us-east-1
- **Database Version**: PostgreSQL 17

---

*Documento creado: Diciembre 2025*
*Última actualización: Diciembre 2025*

