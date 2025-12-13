# Test Plan: Connection Manager

## Overview

Manual testing plan for the new `connectionManager.ts` to verify it properly handles tab visibility changes, network interruptions, and reconnection flows.

---

## Pre-Test Setup

1. Open browser DevTools (F12)
2. Go to Console tab - filter by `[ConnectionManager]`
3. Go to Network tab - useful to simulate offline
4. Have the app running locally: `npm run dev`

---

## Test Cases

### Test 1: Basic Tab Switch (Short Background)

**Scenario:** User switches away briefly and returns

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open app, wait for boxes to load | Boxes visible, console shows `[ConnectionManager] Initialized` |
| 2 | Switch to another tab for **3 seconds** | Console: `[ConnectionManager] Tab hidden` |
| 3 | Return to app tab | Console: `[ConnectionManager] Tab visible`, `Brief background - skipping check` |
| 4 | Verify UI | No loading state, no overlay, data unchanged |

**Pass Criteria:** No health check triggered for short background times (<5s)

---

### Test 2: Long Tab Switch (30+ seconds)

**Scenario:** User leaves tab for extended period

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open app, login if needed | App functional |
| 2 | Switch to another tab for **30+ seconds** | Console: `Tab hidden` |
| 3 | Return to app tab | Console shows: `Tab visible`, `Was in background for Xs`, `Status: connected → checking` |
| 4 | Wait 1-2 seconds | Console: `Status: checking → connected` |
| 5 | Verify HomePage | Boxes reload (check console for `[HomePage] Connection restored`) |

**Pass Criteria:** Health check runs, connection confirmed, data refreshes

---

### Test 3: Rapid Tab Switching (Debounce Test)

**Scenario:** User rapidly switches tabs

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open app | App loaded |
| 2 | Rapidly switch tabs 5 times in 2 seconds | Multiple `Tab hidden` / `Tab visible` logs |
| 3 | Stay on app tab | Only ONE health check runs (debounce working) |

**Pass Criteria:** Console shows only one `Status: checking` despite multiple visibility changes

---

### Test 4: Network Offline Detection

**Scenario:** Device loses network connection

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open app, verify working | Boxes loaded |
| 2 | DevTools → Network → Toggle "Offline" | Console: `[ConnectionManager] Network offline`, `Status: disconnected` |
| 3 | Verify UI | ConnectionOverlay appears with "Sin conexión" message |
| 4 | Toggle "Online" | Console: `Network online`, health check runs |
| 5 | Wait for reconnection | Overlay disappears, status returns to `connected` |

**Pass Criteria:** Offline/online events properly trigger status changes and overlay

---

### Test 5: Failed Health Check → Reconnection

**Scenario:** Connection is stale after long background

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open app, login | Working normally |
| 2 | DevTools → Network → Throttle to "Offline" | |
| 3 | Switch to another tab for 60 seconds | Tab hidden |
| 4 | Return to app (keep offline) | Health check fails, `Status: reconnecting` |
| 5 | Verify overlay | Shows "Reconectando..." with spinner |
| 6 | After retries fail | `Status: disconnected`, overlay shows retry button |
| 7 | Toggle back to "Online" | |
| 8 | Click "Reintentar" button | Reconnection succeeds, overlay disappears |

**Pass Criteria:** Full reconnection flow works, overlay shows appropriate states

---

### Test 6: Auth Session Refresh on Reconnect

**Scenario:** Session needs refresh after background

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login to app | User logged in, balance visible |
| 2 | Switch tab for 60+ seconds | |
| 3 | Return to app | Console: `[ConnectionManager] Status: connected` |
| 4 | Check auth logs | Console: `🔐 Connection restored - refreshing session in background` |
| 5 | Verify user still logged in | Balance still visible, no auth errors |

**Pass Criteria:** Auth session refreshes transparently without logging user out

---

### Test 7: Game Store Reset on Reconnect

**Scenario:** Spinner gets stuck during tab switch

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to box page, start demo spin | Spinner animating |
| 2 | Immediately switch tabs | Spinner potentially stuck |
| 3 | Wait 30+ seconds | |
| 4 | Return to app | Console: `[GameStore] Connection restored - resetting stuck spinning state` |
| 5 | Verify game state | Spinner reset to idle, can spin again |

**Pass Criteria:** Stuck spinning state automatically resets

---

### Test 8: Multiple Reconnection Attempts

**Scenario:** Network is flaky, needs multiple attempts

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open app | Working |
| 2 | DevTools → Network → Throttle "Slow 3G" | |
| 3 | Switch tab for 30 seconds | |
| 4 | Return to app | Health check may timeout |
| 5 | Watch console | `Reconnect attempt 1/2`, then `attempt 2/2` |
| 6 | If both fail | Status becomes `disconnected`, overlay shows |

**Pass Criteria:** System tries multiple times before giving up

---

### Test 9: ConnectionOverlay Auto-Retry

**Scenario:** Overlay automatically retries connection

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Trigger disconnected state (go offline) | Overlay appears |
| 2 | Go back online but don't click retry | |
| 3 | Wait 8 seconds | Overlay shows "Intento X de reconexión" |
| 4 | Verify auto-retry | Reconnection attempts automatically |

**Pass Criteria:** Overlay auto-retries every 8 seconds

---

### Test 10: Mobile Safari Simulation

**Scenario:** Test iOS-like aggressive background suspension

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open app in Chrome | Working |
| 2 | DevTools → More tools → Rendering → Emulate focused page: uncheck | Simulates background |
| 3 | Wait 60 seconds | |
| 4 | Re-check "Emulate focused page" | Health check triggers |
| 5 | Verify reconnection | App recovers gracefully |

**Pass Criteria:** App handles aggressive background suspension

---

## Console Log Reference

Expected logs during normal reconnection flow:

```
[ConnectionManager] Tab hidden
[ConnectionManager] Tab visible
[ConnectionManager] Was in background for 35s
[ConnectionManager] Status: connected → checking
[ConnectionManager] Using cached health check (healthy)  // or performs check
[ConnectionManager] Status: checking → connected
[HomePage] Connection restored - reloading boxes
[GameStore] Connection restored - balance synced
🔐 Connection restored - refreshing session in background
```

Expected logs during failed reconnection:

```
[ConnectionManager] Tab visible
[ConnectionManager] Was in background for 65s
[ConnectionManager] Status: connected → checking
[ConnectionManager] Health check timeout
[ConnectionManager] Status: checking → reconnecting
[ConnectionManager] Starting reconnection...
[ConnectionManager] Reconnect attempt 1/2
[ConnectionManager] Session refresh failed: ...
[ConnectionManager] Recreating Supabase client...
[ConnectionManager] Reconnect attempt 2/2
[ConnectionManager] Reconnection failed after all attempts
[ConnectionManager] Status: reconnecting → disconnected
```

---

## Bug Report Template

If a test fails, document:

```markdown
## Bug: [Short Description]

**Test Case:** #X - [Name]
**Step Failed:** X
**Expected:** [What should happen]
**Actual:** [What actually happened]

**Console Logs:**
```
[paste relevant logs]
```

**Network State:** Online / Offline / Throttled
**Browser:** Chrome / Safari / Firefox
**Device:** Desktop / Mobile
```

---

## Sign-Off

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| 1. Short background | ☐ | ☐ | |
| 2. Long background | ☐ | ☐ | |
| 3. Rapid switching | ☐ | ☐ | |
| 4. Offline detection | ☐ | ☐ | |
| 5. Failed reconnection | ☐ | ☐ | |
| 6. Auth refresh | ☐ | ☐ | |
| 7. Game store reset | ☐ | ☐ | |
| 8. Multiple attempts | ☐ | ☐ | |
| 9. Auto-retry | ☐ | ☐ | |
| 10. Mobile simulation | ☐ | ☐ | |

**Tested By:** _____________  
**Date:** _____________  
**Browser/Version:** _____________  
