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
    _layout.tsx          -- Bottom tabs: Home | Alerts | Locations | Me
    index.tsx            -- Personalized Homepage with Header, Edit, & Grid
    alerts.tsx           -- IMD official bulletins & regional advisories
    locations.tsx        -- Saved & primary location management
    me.tsx               -- User profile, themes, units, & [__DEV__] Dev Options
/components
  /ui
    Icon.tsx             -- Professional unified SVG vector icon system
    Button.tsx           -- Themed buttons (primary, secondary, outline, ghost)
    Card.tsx             -- Art-direction-aware card shell
    Typography.tsx       -- Scale typography consuming useTheme()
  /home
    ThemeSelector.tsx    -- Visual art direction selector with card previews
    WidgetLibrarySheet.tsx -- Modal exposing all 18 widgets for addition
  /widgets
    GridRenderer.tsx     -- Dynamic ordered list with reorder/remove controls
    WidgetCard.tsx       -- Standard widget container with icons, badges, & actions
    WeatherWidgets.tsx   -- All 18 registered weather widget UI components
    useWidgetData.ts     -- Clean mock data boundary (Phase 4 API plug point)
/theme
  types.ts               -- MausamTheme interface with full art direction tokens
  ThemeProvider.tsx      -- React Context providing useTheme() hook
  registry.ts            -- Registry exporting all 11 visual themes
  /themes
    custom.ts, appleLiquid.ts, retroPeaceful.ts, health.ts, fitness.ts,
    beach.ts, travel.ts, parent.ts, agriculture.ts, commuter.ts, event.ts
/lib
  widgetRegistry.ts      -- Complete 18-widget registry with persona weights
  personaEngine.ts       -- Normalized vector scoring & layout assembly
  surveyQuestions.ts     -- Exactly 3 survey questions with multi-persona weights
  citySearch.ts          -- Extensible LocationSearchProvider & locality database
/store
  useAuthStore.ts        -- Zustand: session, guest mode, personaVector, survey status
  useLayoutStore.ts      -- Zustand: activeThemeId, layout, initializeForUser, reset
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
  - Personalization card (Active persona, retake survey, active theme, layout count)
  - Location management (Primary location shortcut)
  - Units & preferences (°C/°F, km/h vs m/s)
  - About Mausam (version & open source license)
  - **Developer Options** (under `__DEV__`): One-click full reset and instant persona layout seeding for testing.
