# Frontend Architecture Document
## Mausam — Personalized Weather Platform (React Native / Expo)

---

## 1. Core Principles

- **Infinite Customization**: Pre-defined personas are purely a recommendation engine for first launch. The user owns their homepage layout completely. They can add, remove, and reorder widgets across the entire registry indefinitely.
- **Decoupled Themes & Art Directions**: Persona (data preference) is strictly decoupled from Theme (visual presentation). A theme is a complete visual art direction (controlling card shapes, borders, visual density, typography hierarchy, iconography, shadows, and atmosphere), not merely a color palette. Any user can select any theme regardless of persona.
- **Local-Level Accuracy**: Location support operates at locality/neighborhood granularity (e.g. Mundka, Rohini, Saket, Bandra, Koramangala) via device GPS or the extensible `LocationSearchProvider`.

---

## 2. Directory Structure (Expo Router)

```
/app
  _layout.tsx            -- Root Stack layout with ThemeProvider wrapping
  index.tsx              -- Root gatekeeper routing to /onboarding or /(tabs)
  /onboarding
    index.tsx            -- Landing screen (Get Started / Sign In)
    auth.tsx             -- Auth options + Continue as Guest
    survey.tsx           -- Exactly 3 questions (multi-select, blended vector)
    location-setup.tsx   -- Device GPS + Locality search + hierarchy confirmation
  /(tabs)
    _layout.tsx          -- Bottom tabs: Home | Alerts | Locations | Me (Glass Dock)
    index.tsx            -- Personalized Homepage with Header, Edit, & Grid
    alerts.tsx           -- IMD official bulletins & regional advisories
    locations.tsx        -- Saved & primary location management
    me.tsx               -- User profile, themes, companion bonding stats, & units
/components
  /companion
    MausamCatSvg.tsx     -- 100% Vector SVG mascot rig with eye mask & gaze tracking
    CompanionPerch.tsx   -- Visual perch, speech bubble, dream particles, & quick actions
  /theme
    ThemeStudioModal.tsx -- Live interactive custom theme editor
  /ui
    Icon.tsx             -- Professional unified SVG vector icon system
    Button.tsx           -- Themed buttons (primary, secondary, outline, ghost)
    Card.tsx             -- Art-direction-aware card shell (elevation: 0 glass)
    Typography.tsx       -- Scale typography consuming useTheme()
    WeatherAtmosphere.tsx-- SVG dynamic atmospheric sky canvas
  /home
    MainWeatherHero.tsx  -- Apple Weather-grade centerpiece & companion integration
    ThemeSelector.tsx    -- Visual art direction selector with card previews
    WidgetLibrarySheet.tsx -- Modal exposing all 18 widgets for addition
  /widgets
    GridRenderer.tsx     -- Dynamic ordered list with drag reorder & scroll telemetry
    WidgetCard.tsx       -- Standard widget container with icons, badges, & actions
    WeatherWidgets.tsx   -- All 18 registered weather widget UI components
    useWidgetData.ts     -- Live weather caching & derived metrics data hook
/theme
  types.ts               -- MausamTheme interface with full art direction tokens
  ThemeProvider.tsx      -- React Context providing useTheme() hook
  registry.ts            -- Registry exporting all 11 visual themes
  /themes
    custom.ts, appleLiquid.ts, retroPeaceful.ts, health.ts, fitness.ts,
    beach.ts, travel.ts, parent.ts, agriculture.ts, commuter.ts, event.ts
/lib
  /companion
    companionEvents.ts   -- Decoupled type-safe event bus
    companionBrain.ts    -- 5-level priority engine, gaze targeting, transitions
    companionRemarks.ts  -- 21 categorized remarks library with 5-message ring buffer
  i18n.ts                -- Bhasha Engine (English + 6 Regional Indian Languages)
  weatherService.ts      -- Live Open-Meteo & IMD client with in-memory caching
  alertService.ts        -- District-level severe weather alert parser
  notificationService.ts -- Push notifications & severe alert processor
  derived.ts             -- Comfort Index, Douglas Sea Scale, Frost Risk calculations
  widgetRegistry.ts      -- Complete 18-widget registry with persona weights
  personaEngine.ts       -- Normalized vector scoring & layout assembly
  surveyQuestions.ts     -- Exactly 3 survey questions with multi-persona weights
  citySearch.ts          -- Extensible LocationSearchProvider & locality database
/store
  useAuthStore.ts        -- Zustand: session, guest mode, personaVector, survey status
  useCompanionStore.ts   -- Zustand: Mimi state, affinity, inactivity timers, wake
  useCustomThemeStore.ts -- Zustand: persistent custom themes generated in Studio
  useLayoutStore.ts      -- Zustand: activeThemeId, layout, initializeForUser, reset
  useLocaleStore.ts      -- Zustand: activeLocale, t() dictionary lookups
  useLocationStore.ts    -- Zustand: primary & saved locations with coordinates
```

---

## 3. The 18-Widget Inventory (PRD §8 & TRD §4)

| Widget ID | Component | Primary Persona | Category |
|---|---|---|---|
| `current_summary` | `CurrentSummaryWidget` | All (Base row) | Essential |
| `aqi_card` | `AqiWidget` | Health, Agriculture | Health |
| `uv_index` | `UvIndexWidget` | Health, Beach, Fitness | Health & Outdoors |
| `pollen_estimate` | `PollenWidget` | Health, Parent | Health |
| `best_run_hours` | `BestRunHoursWidget` | Fitness | Fitness |
| `sunrise_sunset` | `SunriseSunsetWidget` | Fitness, Beach, Event | Outdoors |
| `sea_state` | `SeaStateWidget` | Beach | Marine |
| `tide_times` | `TideTimesWidget` | Beach | Marine |
| `destination_weather` | `DestinationWeatherWidget` | Travel | Travel |
| `packing_tip` | `PackingTipWidget` | Travel | Travel |
| `school_commute` | `SchoolCommuteWidget` | Parent, Commuter | Family |
| `rain_timeline` | `RainTimelineWidget` | Commuter, Parent, Event | Essential |
| `frost_alert` | `FrostAlertWidget` | Agriculture | Agriculture |
| `rainfall_forecast` | `RainfallForecastWidget` | Agriculture | Agriculture |
| `soil_moisture` | `SoilMoistureWidget` | Agriculture | Agriculture |
| `visibility_fog` | `VisibilityFogWidget` | Commuter | Commute |
| `extended_forecast` | `ExtendedForecastWidget` | Event, Travel | Planning |
| `comfort_index` | `ComfortIndexWidget` | Event, Health | Planning |

---

## 4. Visual Themes & Art Directions

Themes define full visual atmospheres via `artDirection`:
- **Custom**: Clean, adaptable baseline. Standard card elevation and 12px radius.
- **Apple Liquid**: Frosted glass surfaces (`rgba(255,255,255,0.82)`), specular highlight borders, soft diffuse shadows, fluid 18px corners.
- **Retro Peaceful 2D**: 2D flat illustration style, 2.5px solid dark outline, zero corner radius, hard comic drop shadow, warm aged parchment background.
- **Health**: Sterile clean white, hairline dividers, precision data badges, medical cyan accents.
- **Fitness**: High-contrast OLED black (`#09090B`), hyper-vibrant neon lime (`#A3E635`), glowing borders.
- **Beach**: Ocean teal and warm sun, seafoam background, ultra-curved organic pebble shapes (28px radius).
- **Travel**: Airport boarding pass styling, dashed perforation dividers, deep passport navy.
- **Parent**: High-legibility typography, soft buttercup yellow background, friendly generous tap targets.
- **Agriculture**: Fertile earth tones, forest green accents, 2px rugged ledger borders, blocky field geometry.
- **Commuter**: Night highway asphalt slate (`#0F172A`), high-visibility road caution amber, glanceable HUD density.
- **Event**: Wedding stationery ivory (`#FAFAF9`), champagne gold highlights, generous breathing room.

---

## 5. Navigation & User Controls

- **Bottom Navigation**: `Home | Alerts | Locations | Me` with custom SVG icons and theme-reactive tints.
- **Homepage**: Clean header displaying "Mausam", active locality with map pin, and Customize toggle. No permanent floating gears.
- **Me Page**: User's central control hub containing:
  - Profile card (Guest / User status)
  - Companion Card (Mimi toggle, affinity level, pet & treat stats)
  - Personalization card (Active persona, retake survey, active theme, layout count)
  - Custom Theme Studio modal trigger
  - Bhasha language picker (English + 6 regional languages)
  - Location management (Primary location shortcut)
  - Units & preferences (°C/°F, km/h vs m/s)
  - About Mausam (version & open source license)
  - **Developer Options** (under `__DEV__`): One-click full reset and instant persona layout seeding for testing.

---

## 6. Interactive Cat Companion ("Mimi — मौसम साथी")

- **Vector SVG Rig**: 100% scalable vector geometry in `MausamCatSvg.tsx` with animated breathing, swaying tail, dynamic bongo paws, and context-driven accessories (rain umbrella, sunglasses, scarf, fan, and silk sleeping eye mask).
- **Gaze Tracking**: Eye pupils and head tilt smoothly rotate toward user gestures and screen elements (`'user'`, `'left'`, `'right'`, `'up'`, `'down'`).
- **5-Level Priority Engine**: Structured state machine in `companionBrain.ts` resolving animations by priority score (Critical = 100, Major = 80, Interaction = 65–72, Contextual = 35–50, Ambient = 10–25).
- **Inactivity & Single-Tap Wake**: Progresses through 5 tiers into deep sleep with an embroidered silk eye mask and floating zZZ dream particles. Wakes up immediately on a single tap.
- **Personality Remarks Engine**: 21 categories in `companionRemarks.ts` equipped with a 5-message FIFO ring buffer and affinity gates.

---

## 7. Bhasha Engine (Multilingual Localization)

- **Regional Language Coverage**: Centralized string catalog in `lib/i18n.ts` covering English plus 6 official Indian languages: Hindi (`hi`), Bengali (`bn`), Marathi (`mr`), Tamil (`ta`), Telugu (`te`), and Kannada (`kn`).
- **State Integration**: Managed by `useLocaleStore.ts` with immediate, flicker-free runtime switching across all widget titles, telemetry labels, and navigation tabs.

---

## 8. Custom Theme Studio

- **Visual Architecture**: Allows complete dynamic theme generation in `components/theme/ThemeStudioModal.tsx`.
- **Customizable Tokens**: Card border radius, primary accent colors, card surface translucency, and outline widths.
- **Persistence**: Saved themes persist in `useCustomThemeStore.ts` and can be activated at any time alongside the 11 built-in art directions.
