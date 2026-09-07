# Product Requirements Document (PRD)
## Mausam — Personalized Homepage
**SIH 2026 — Problem Statement 26076 | Ministry of Earth Sciences / IMD**
**Platform: Native/cross-platform mobile application (Android + iOS), not a website**

---

## 1. Purpose

Design and build a personalization layer for IMD's official "Mausam" mobile app. On first use, a short onboarding survey classifies the user into a weighted blend of eight personas. The app then auto-assembles a homepage from a widget library scored against that persona blend, and lets the user manually customize it afterward.

## 2. Problem Statement (as given)

IMD's Mausam app currently shows the same generic layout to every user. Different user groups care about different subsets of weather data:

| Persona | Cares most about |
|---|---|
| Health-conscious | AQI, pollen count, UV index, humidity |
| Outdoor fitness | Sunrise/sunset, best running hours, wind speed, heat alerts |
| Beachgoers & surfers | Sea conditions, tide timings, wave height, water temperature |
| Travelers | Saved destinations, severe alerts for flights, packing suggestions |
| Parents & families | School commute conditions, rain alerts, severe warnings |
| Agriculture & gardeners | Soil moisture, rainfall predictions, frost alerts, planting guidance |
| Commuters | Traffic + visibility + storm/fog alerts |
| Event planners | Extended forecasts, rain probability, comfort index |

## 3. Goals

- **INFINITE CUSTOMIZATION**: The pre-defined personas are only a recommendation engine and a starting point. Mausam is designed around continuous, infinite customization. Users can create a completely custom homepage, blending widgets across all categories. The system should NEVER make users feel permanently locked into a single persona.
- **DECOUPLED THEMES**: A persona represents *what* information the user wants (data/widgets). A theme represents *how* it looks (visuals). These must be strictly decoupled. A user can be a "Fitness" persona but use the "Apple Liquid" or "Beach" visual theme. The system must support an extensible theme architecture.
- Reduce time-to-relevant-info: a new user should see data that matters to them within one survey (under ~60 seconds) with no manual setup.
- Accommodate blended profiles: The survey should result in a normalized persona vector that correctly reflects combinations of interests (dominant, secondary, blended) rather than forcing a user into one rigid persona box.
- Cover all 8 personas from the problem statement with at least one dedicated widget each.
- Let users override the auto-generated layout at any time, adding, removing, and reordering widgets to continuously evolve their homepage.
- Provide a clear "Custom" personalization path during onboarding for users who want complete control over their layout.
- Ship a working, judge-demoable build on real IMD/Open-Meteo/INCOIS data.

## 4. Scope Boundaries

- Native OS home-screen widgets (iOS WidgetKit / Android App Widgets) — this is an **in-app** personalized homepage screen, not a device home-screen widget, unless time allows as a stretch goal.
- Flight-specific live data (actual flight numbers/gate info) — travelers persona uses destination-city alerts, not real aviation data.
- Multi-language localization — **Delivered** in app via the Bhasha Engine (English, Hindi, Hinglish, Marathi, Bengali, Tamil, Telugu).
- Monetization/ads — strictly out of scope, this is a public utility app.

## 5. Target Users & User Stories

For each persona, representative user stories:

- **Health-conscious**: "As an asthma sufferer, I want to see today's AQI and pollen level first thing, so I know whether to go outside."
- **Outdoor fitness**: "As a runner, I want to know the best hour to run today based on temp/humidity/wind, so I can plan my workout."
- **Beachgoers/surfers**: "As a surfer, I want tide times and wave height for my coastal town, so I know when conditions are good."
- **Travelers**: "As someone flying to Mumbai next week, I want to see alerts for that city now, so I can plan around them."
- **Parents**: "As a parent, I want to know if it'll rain during school drop-off hours, so I can plan the commute."
- **Agriculture**: "As a farmer, I want frost and rainfall alerts for my field's location, so I can protect my crop."
- **Commuters**: "As a daily commuter, I want to know if fog or storms will affect visibility on my route today."
- **Event planners**: "As someone planning an outdoor wedding, I want an extended forecast and a 'comfort index' for the date."

## 6. Functional Requirements

### FR1 — Onboarding & Persona Survey
- Exactly 3 survey questions (multi-select supported where appropriate) on first app open.
- Produces a normalized persona weight vector that reflects combinations/blends of interests, never a single rigid label.
- Custom/Guest path: user can choose "Custom" or skip the survey to get a blank/generic homepage, giving them complete control to add widgets manually from the start.

### FR2 — Location Capture
- Request device location permission ("while using the app" only — not background/always).
- Manual city/location search as a fallback and for saving additional locations (home/work/travel).

### FR3 — Persona-Based Homepage Generation
- On survey submit, score all widgets in the library against the user's persona vector and select the top N (~6–8) plus an always-shown base row (current temp, high/low, one-line summary).
- Store the generated layout to the user's profile.

### FR4 — Widget Library
- One widget type per persona-relevant data category (see PRD §2 table + PRD §8 widget list).
- Every widget: consistent props contract, independent loading/error state (one widget failing must not break the screen).

### FR5 — Manual Customization
- User can add any widget from the full library (not just their persona's), remove widgets, and reorder them.
- Changes save immediately to the user's profile.
- (Optional/stretch) Adding/removing a widget slightly nudges the stored persona vector toward/away from that widget's owning persona.

### FR6 — Alerts
- Pull active IMD district-wise warnings for the user's saved locations.
- Show a compact banner on the homepage when there's an active severe alert for the default location.
- Full alerts list screen for all saved locations.

### FR7 — Re-survey
- User can retake the survey from Settings. The newly suggested layout is compared to the currently saved layout; only prompt to apply if they differ meaningfully — never silently overwrite a manually customized layout.

### FR8 — Offline Behavior
- Cache the last successfully fetched forecast/AQI/alerts per saved location.
- If offline, show cached data with a clear "last updated" timestamp rather than a blank/broken screen.

### FR9 — Interactive Weather Companion ("Mimi — मौसम साथी")
- 100% vector SVG animated character perched on the homepage hero and accessible across tabs.
- Multi-dimensional reactive engine responding to weather conditions (rain, sun, wind, thunder, snow, fog), time of day, inactivity tiers, and direct user actions.
- Touch interaction progression: single tap (greeting/perk up), rapid taps (playful dizziness), long press (petting/purr), treat giving (snack feeding).
- Deep Sleep Mode: Tier 5 inactivity (120s+) or late-night (1 AM – 6 AM) equips an embroidered silk sleeping eye mask (curved dual-lobe cushion, nose notch, elastic band, golden eyelashes & crescent moon).
- Single-Tap Awakening: A single tap instantly removes the mask, plays a yawn/stretch animation, speaks a morning/wake remark, and fully awakens Mimi to normal alertness.
- 100% offline, deterministic rule engine with zero chatbot latency.

### FR10 — Multilingual Bhasha Engine
- First-class support for 7 languages: English, Hindi (हिंदी), Hinglish (हिंग्लिश), Marathi (मराठी), Bengali (বাংলা), Tamil (தமிழ்), and Telugu (తెలుగు).
- Seamless instant switching without reloading, persisted in local storage.

### FR11 — Custom Theme Studio & Curated Aesthetic Themes
- 11 distinct handcrafted visual themes: Apple Liquid (glassmorphic), Retro 2D Peaceful, Health, Fitness, Beach, Travel, Parent, Agriculture, Commuter, Event, and Custom.
- Interactive Theme Studio allowing customization of background gradients, card opacity, blur intensity, corner radius, and accent colors with live real-time preview.

## 7. Non-Functional Requirements

- **Performance**: homepage should render from cache instantly, then update in place as fresh data arrives (no full-screen loading blocker after first load).
- **Battery**: use coarse/"while in use" location, not continuous background GPS polling.
- **Privacy**: location used only for weather lookups; no data sold or shared with third parties; clear in-app explanation before requesting permission.
- **Accessibility**: readable font sizes, sufficient color contrast for alert severity colors (not red/green alone), screen-reader labels on widgets.
- **Resilience**: any single failed API call degrades that one widget, not the whole screen.

## 8. Widget Inventory (maps to TRD's `WIDGET_PERSONA_RELEVANCE`)

| Widget ID | Description | Primary persona(s) |
|---|---|---|
| `current_summary` | Temp, high/low, one-line summary | All (base row) |
| `aqi_card` | AQI + PM2.5/PM10 | Health |
| `pollen_estimate` | Seasonal pollen indicator | Health |
| `uv_index` | UV index + sun-protection tip | Health |
| `best_run_hours` | Ranked best hours to be outdoors | Fitness |
| `sunrise_sunset` | Sunrise/sunset times | Fitness, Beach, Event |
| `sea_state` | Wave height, sea condition | Beach |
| `tide_times` | Tide timings (INCOIS) | Beach |
| `destination_weather` | Weather for saved travel destinations | Travel |
| `packing_tip` | Derived packing suggestion | Travel |
| `school_commute` | Forecast for commute time window | Parent |
| `rain_timeline` | Hour-by-hour rain probability | Parent, Commuter, Event |
| `frost_alert` | Frost-risk flag | Agriculture |
| `rainfall_forecast` | District rainfall prediction | Agriculture |
| `soil_moisture` | Approximate soil moisture | Agriculture |
| `visibility_fog` | Visibility + fog risk | Commuter |
| `extended_forecast` | 7–15 day outlook | Event, Travel |
| `comfort_index` | Derived comfort score | Event |
| `alert_banner` | Active severe alert | All (conditional) |

## 9. Success Metrics (for demo/judging, not production analytics)

- All 8 personas produce a visibly different default homepage when demoed with seeded accounts.
- Time from "open survey" to "personalized homepage rendered" under a few seconds with real API data.
- Manual customization persists across app restarts.

## 10. Assumptions & Constraints

- IMD API access (`api.imd.gov.in`) may require registration/IP whitelisting — build against mocked response shapes first so this doesn't block development (see TRD §7).
- Free-tier infrastructure only (no paid API tiers, no paid cloud compute).
- Small team, AI-assisted development for both mobile frontend and backend.
