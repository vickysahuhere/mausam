# Technical Requirements Document (TRD)
## Mausam — Personalized Homepage
**Platform: Mobile app (Android + iOS), free-tier infrastructure only**

---

## 1. Architecture Overview

```
┌─────────────────────────────┐
│   Mobile App (React Native  │
│   / Expo — iOS + Android)   │
│                              │
│  Screens • Widget components│
│  Persona engine (client-side│
│  scoring logic)              │
└───────────────┬──────────────┘
                │ HTTPS
                ▼
┌─────────────────────────────┐
│  Backend layer               │
│  (Supabase: Postgres + Auth  │
│  + Edge Functions)            │
│                              │
│  - Auth (email/OTP)          │
│  - user_profiles, layouts,   │
│    locations, survey data    │
│  - Edge Functions wrap       │
│    external weather APIs     │
│    (keeps IMD IP-whitelisted │
│    calls + keys server-side) │
└───────────────┬──────────────┘
                │
    ┌───────────┼────────────┬───────────────┐
    ▼           ▼            ▼               ▼
Open-Meteo   IMD API      INCOIS         (future: CPCB
(forecast,  (alerts,     (tide/sea       AQI, etc.)
AQI)        nowcasts)    state)
```

Key decision: **all external weather API calls happen server-side** (Supabase Edge Functions), never directly from the mobile client. This keeps IMD credentials/whitelisted IPs secure and lets you add response caching in one place.

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Mobile framework** | **React Native + Expo** | Single codebase for iOS + Android, free, huge amount of training data so AI-assisted generation is reliable, Expo Go lets you demo on a physical phone without app-store builds during the hackathon. |
| **Navigation** | React Navigation (bottom tabs + stack) | Standard, free, well-documented for AI tools to generate against. |
| **State management** | Zustand (or React Context for a smaller app) | Lightweight, avoids Redux boilerplate. |
| **Styling** | React Native StyleSheet + a small design-token file (colors/spacing) | Keep it simple; no CSS framework needed in RN. |
| **Backend** | **Supabase** (free tier) — Postgres DB, Auth, Edge Functions, Row-Level Security | One free service for DB + auth + serverless functions; avoids standing up a separate Node/Express server. |
| **Weather data** | Open-Meteo (forecast + AQI, free, no key) + IMD `api.imd.gov.in` (alerts/nowcasts, India-specific, free but needs registration) + INCOIS (tide/sea state, free, bulletin-style) | As established; all free-tier/no-cost. |
| **Local caching** | `@react-native-async-storage/async-storage` (or Expo's `expo-sqlite` for structured cache) | Enables offline fallback per PRD FR8. |
| **Push notifications (stretch)** | Expo Notifications (free) | If time allows for severe-alert push. |
| **Charts** | `react-native-svg` + `victory-native` (or simple custom bars) | For rain-probability / comfort-index visuals. |
| **Testing** | Jest (unit tests on persona engine + derived-index functions) | Free, standard RN testing setup. |
| **Hosting/CI** | Supabase free tier for backend; Expo's free build/publish for app distribution during hackathon (EAS free tier for a demo build) | No paid app-store listing needed for a hackathon demo — Expo Go or an internal EAS build is enough. |

> Note on native home-screen widgets: true iOS/Android home-screen widgets require platform-specific native code (WidgetKit/Glance) outside Expo's managed workflow. Treat as a stretch goal, not MVP — the "personalized homepage" is an in-app screen, which satisfies the problem statement's actual ask.

## 3. Data Model (Supabase/Postgres)

```sql
-- users: handled by Supabase Auth automatically

user_profiles (
  user_id        uuid primary key references auth.users,
  persona_vector jsonb,        -- { health: 0.3, fitness: 0.5, ... }
  created_at     timestamptz default now()
)

user_locations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users,
  label      text,             -- 'home' | 'work' | 'travel'
  lat        float8,
  lon        float8,
  is_default boolean default false
)

user_layouts (
  user_id    uuid primary key references auth.users,
  layout     jsonb,            -- [{ widget_id, position, size }, ...]
  updated_at timestamptz default now()
)

survey_responses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users,
  answers      jsonb,          -- raw selected answer ids
  submitted_at timestamptz default now()
)
```

Row-Level Security: every table above scoped so `auth.uid() = user_id` for all reads/writes — set this up in Part 2 of the build plan, not as a later fix.

## 4. Persona Engine (algorithm spec)

```ts
type Persona = 'health' | 'fitness' | 'beach' | 'travel'
             | 'parent' | 'agriculture' | 'commuter' | 'event';

// Answer id → partial persona points (not a single label per answer)
const SURVEY_WEIGHTS: Record<string, Partial<Record<Persona, number>>> = {
  'q1_health':     { health: 3 },
  'q1_fitness':    { fitness: 3, health: 1 },
  'q1_beach':      { beach: 3 },
  'q1_travel':     { travel: 3 },
  'q1_parent':     { parent: 3 },
  'q1_agriculture':{ agriculture: 3 },
  'q1_commute':    { commuter: 3 },
  'q1_events':     { event: 3 },
  'q3_air_quality':{ health: 2, agriculture: 1 },
  'q3_rain_alerts':{ commuter: 2, parent: 2, agriculture: 1 },
  'q3_outdoor_time':{ fitness: 2, beach: 1, event: 1 },
  'q3_travel_plans':{ travel: 2 },
  'q3_school_run': { parent: 3 },
  'q3_planting':   { agriculture: 3 },
};

function buildPersonaVector(selectedAnswerIds: string[]): Record<Persona, number> {
  const raw: Record<Persona, number> = {
    health: 0, fitness: 0, beach: 0, travel: 0,
    parent: 0, agriculture: 0, commuter: 0, event: 0,
  };
  for (const id of selectedAnswerIds) {
    const w = SURVEY_WEIGHTS[id] ?? {};
    for (const [p, val] of Object.entries(w)) raw[p as Persona] += val;
  }
  const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
  const vector = {} as Record<Persona, number>;
  for (const p of Object.keys(raw) as Persona[]) vector[p] = raw[p] / total;
  return vector;
}

// Widget id → partial persona relevance (most widgets owned by one persona,
// with minor secondary relevance)
const WIDGET_PERSONA_RELEVANCE: Record<string, Partial<Record<Persona, number>>> = {
  aqi_card:         { health: 1.0, agriculture: 0.3 },
  best_run_hours:   { fitness: 1.0 },
  school_commute:   { parent: 1.0, commuter: 0.4 },
  rain_timeline:    { commuter: 1.0, parent: 0.6, event: 0.4 },
  // ... one entry per widget (see PRD §8 for full list)
};

function scoreWidget(widgetId: string, vector: Record<Persona, number>): number {
  const relevance = WIDGET_PERSONA_RELEVANCE[widgetId] ?? {};
  return Object.entries(relevance)
    .reduce((sum, [p, r]) => sum + r * vector[p as Persona], 0);
}

function selectTopWidgets(vector: Record<Persona, number>, n: number): string[] {
  return Object.keys(WIDGET_PERSONA_RELEVANCE)
    .map(id => ({ id, score: scoreWidget(id, vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(w => w.id);
}
```

## 5. Derived-Index Helpers (`/lib/derived.ts`)

Pure functions, unit-testable, shared across widgets:

- `bestRunningHours(hourly)` — scores each hour by temp/humidity/wind/AQI, returns ranked hours.
- `comfortIndex(temp, humidity, wind)` — simple weighted formula for event-planner widget.
- `frostAlert(hourly)` — flags hours where temperature drops below a threshold.

## 6. API Contracts (Supabase Edge Functions)

| Endpoint | Input | Output (normalized) |
|---|---|---|
| `/functions/weather` | `lat`, `lon` | `{ current, hourly[], daily[] }` |
| `/functions/aqi` | `lat`, `lon` | `{ aqi, pm25, pm10 }` |
| `/functions/alerts` | `lat`, `lon` or `district` | `{ activeAlerts: [{ severity, type, message, validUntil }] }` |
| `/functions/sea` | `lat`, `lon` | `{ tideTimes[], waveHeight, seaState }` |

All endpoints:
- Return a consistent shape regardless of which upstream source they wrap, so widgets never need source-specific parsing.
- Cache upstream responses for 10–15 min server-side (per IMD's own caching guidance) to avoid re-hitting rate-sensitive endpoints on every widget render.

## 7. Mock-First Development Strategy

Because IMD API approval/whitelisting is the single biggest schedule risk:

1. Define the normalized response shapes above *first*.
2. Build `/functions/alerts` against a hardcoded mock JSON matching IMD's documented response shape.
3. Swap the mock for the real IMD call once access is approved — because widgets only depend on the normalized shape, this swap should require zero changes to frontend code.

## 8. Non-Functional Implementation Notes

- **Offline**: cache the last successful response per endpoint+location in AsyncStorage/SQLite; homepage reads cache first, then reconciles with a fresh fetch.
- **Location permission**: request `whenInUse` only; never request background/always location.
- **Error isolation**: each widget component wraps its own fetch in try/catch and renders its own error state — a single upstream failure must not crash the screen.
- **Testing**: Jest unit tests for `buildPersonaVector`, `scoreWidget`, and all `/lib/derived.ts` functions — these are pure functions and the "smart" part of the demo, so they're worth testing even under time pressure.

## 9. Free-Tier Constraints Checklist

- Supabase free tier: fine for hackathon-scale usage (limited monthly active users/DB size, but sufficient for a demo + seeded accounts).
- Expo/EAS free tier: enough builds for a hackathon demo; a full production App Store/Play Store listing needs the $99/yr Apple Developer account and $25 one-time Play Console fee — **not required for the hackathon demo itself**, only for real public distribution later.
- Open-Meteo: free, no key, no practical rate limit for this scale.
- IMD: free but requires registration and possibly IP whitelisting — start this in Part 1 of the build plan.
- INCOIS: free, public data pages — may require light scraping/parsing rather than a clean REST API.
