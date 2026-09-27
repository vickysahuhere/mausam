# App Flow Document
## Mausam — Personalized Homepage (Mobile)

---

## 1. Navigation Structure

```
Root Navigator (Stack)
│
├── Onboarding Stack (shown only if no session / first launch)
│    ├── Splash
│    ├── Landing
│    ├── Auth (Login/Signup, or Skip → Guest)
│    ├── Survey (multi-step)
│    └── LocationSetup
│
└── Main Tab Navigator (shown after onboarding / on return visits)
     ├── Tab: Home            → PersonaHomepage
     ├── Tab: Alerts          → AlertsFeed
     ├── Tab: Locations       → LocationManager
     └── Tab: Settings        → Settings → (Re-survey, Customize, Units, Account)
```

Customization is reached from Home (an "Edit" action) or from Settings, not its own tab — it's an editing mode over the Home screen, not a separate destination.

---

## 2. Screen-by-Screen Flow

### 2.1 Splash
- Checks for an existing session.
- If session + saved layout exists → go straight to **Main Tab Navigator → Home**.
- If session but no persona vector yet (e.g. account created but survey skipped) → **Landing/Survey prompt**.
- If no session → **Landing**.

### 2.2 Landing
- App name, one-line pitch, "Get Started" button.
- → **Auth**

### 2.3 Auth
- Email or phone OTP login/signup (Supabase Auth).
- "Continue as Guest" option → skips account creation, uses local-only state until the user chooses to save a layout (at which point they're prompted to sign up).
- → **Survey**

### 2.4 Survey (multi-step, one question per screen with progress dots)
- Q1: "What brings you here most?" (single-select, maps to primary persona)
- Q2: "What matters most to you day-to-day?" (multi-select, 2–3 picks)
- Q3 (optional fine-tune, conditional on Q1): e.g. if fitness selected, "What's your main outdoor activity?"
- "Skip for now" always available → generic default homepage, prompt to complete survey later from Settings.
- On submit → persona engine runs client-side (or via Edge Function) → `buildPersonaVector()` → saved to `user_profiles` → **LocationSetup**

### 2.5 LocationSetup
- Request "while using the app" location permission.
- If granted: reverse-geocode to set as default location.
- If denied/unavailable: manual city search field.
- → **Main Tab Navigator → Home**

### 2.6 Home (Persona Homepage)
- **MainWeatherHero**: High-contrast 78px temperature display, high/low glass pill, floating weather centerpiece, and micro-telemetry glass pills (AQI, Wind, Humidity).
- **Mimi Companion Perch**: Interactive weather-aware companion seated below hero chips with speech bubble, animated tails/paws, gaze tracking, and petting/treat quick actions.
- Below: top-N widgets selected by `selectTopWidgets(vector, n)`, rendered in saved layout order.
- Alert banner appears at top if there's an active severe alert for the default location.
- "Customize" button (sliders icon in header) → enters **Customize mode** (drag handles, move up/down, remove buttons, "+ Add widget").
- Pull-to-refresh re-fetches all widget data and increments companion session refresh counter.
- Each widget independently shows loading/error state — one failed widget never blocks the rest of the screen.

### 2.7 Customize Mode (interactive mode on Home)
- Drag-and-drop reorder via `DraggableFlatList` and one-tap Move Up / Move Down buttons.
- Remove button per widget.
- "+ Add widget" opens **Widget Library** bottom sheet listing every widget from every persona, with add/remove toggles.
- "Save / Done" persists layout order to `user_layouts`.

### 2.8 Alerts (tab)
- List of active IMD warnings across all saved locations, sorted by severity and recency.
- Tapping an alert expands details (type, severity, valid-until, affected area).

### 2.9 Locations (tab)
- List of saved locations (home/work/travel), each with live current-conditions preview.
- "+ Add location" → GPS auto-detection or locality search.
- One-tap primary location selection emits `location_changed` to companion.

### 2.10 Me / Settings (tab)
- **Companion Profile**: Master toggle for Mimi, affinity bonding level (Lv. 1–10), and pet/treat counters.
- **Language Switcher (Bhasha Engine)**: Real-time switching between English, हिन्दी, বাংলা, मराठी, தமிழ், తెలుగు, and ಕನ್ನಡ.
- **Theme Studio**: Custom visual theme builder for primary colors, border radii, and card translucency.
- **Personalization**: Active persona display, "Retake Survey", and reset layout.
- **Units & Preferences**: Metric/Imperial toggles (°C/°F, km/h vs m/s).
- **Developer Options** (in `__DEV__`): One-click full reset and instant persona layout seeding for testing.

---

## 3. Key State Transitions

| Trigger | Effect |
|---|---|
| Survey submitted | `persona_vector` saved → default layout generated → navigates to Home |
| Widget added/removed in Customize mode | `user_layouts` updated; (optional) `persona_vector` nudged toward/away from that widget's owning persona |
| Re-survey completed | New vector computed; compared against current saved layout; user prompted only if meaningfully different |
| Location changed to non-default | Home re-fetches all widget data for the new default location |
| Network unavailable | Home renders last cached data per widget with a "last updated" timestamp instead of blocking |
| Severe alert becomes active for default location | Alert banner appears on Home; Alerts tab badge increments |

---

## 4. Guest Mode Behavior

- Guest users get full Home/Alerts/Locations/Settings functionality, but layout and locations are stored locally only (not synced to Supabase).
- Any action that would normally write to `user_layouts`/`user_locations` instead writes to local storage.
- If a guest later signs up, offer to migrate local state into their new account rather than discarding it.
