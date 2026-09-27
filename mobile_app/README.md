# Mausam — मौसम

Mausam is a modern, personalized weather application built with React Native and Expo for the Indian Meteorological Department (IMD) / SIH 2026. Rather than presenting a static, one-size-fits-all dashboard, Mausam dynamically adapts to individual user needs through onboarding persona vectors, authentic visual art directions, regional language localization, and an interactive, weather-aware living companion named **Mimi**.

---

## 🌟 Key Features

### 1. 🐾 Mimi — The Living Weather Companion 
* **Context-Aware Mascot**: Mimi is not a chatbot or static icon. Mimi lives inside the weather hero, reacting through 100% vector SVG animations, eye gaze tracking, and expressive postures.
* **5-Level Priority & Preemption Engine**: Preempts lower-level animations when critical events occur (Level 5: Severe storm alerts, Level 4: Weather transitions, Level 3: Touch interactions, Level 2: Contextual scrolling, Level 1: Ambient idle routines).
* **Gaze Direction Tracking**: Mimi's pupils dynamically look toward the temperature card (`left`), weather condition chips (`right`), incoming rain clouds (`up`), and scrolling forecast widgets (`down`).
* **Tiered Inactivity & Deep Sleep**: Progresses through 5 inactivity tiers when left untouched. At Tier 5 (Deep Sleep), Mimi curls up and wears a **detailed silk sleeping eye mask** with embroidered golden eyelashes and a crescent moon motif.
* **Instant Single-Tap Wake**: Tapping Mimi while she sleeps immediately removes the mask, stretches with a yawn, and speaks a friendly greeting.
* **Behavioral Tracking & Ring Buffer**: Features 21 categorized remarks with a 5-message ring buffer to prevent repetitive speech. Reacts to repeated refreshes ($\ge 3$), repeated temperature taps ($\ge 3$), and prolonged user absences ($>8\text{h}$, $>48\text{h}$, late-night 1–5 AM).

### 2. 🎨 Infinite Customization & Decoupled Art Directions
* **Complete Layout Freedom**: Add, remove, and drag-to-reorder any of the 18 weather widgets across all persona categories.
* **11 Visual Themes**: Decoupled from persona data. Includes **Apple Liquid** (frosted glassmorphism, specular highlights, floating glass tab dock), **Retro Peaceful 2D** (comic outlines, paper parchment texture), **Fitness** (OLED dark mode with neon lime), **Beach** (ocean teal and organic pebbles), and more.
* **Custom Theme Studio**: Allows users to build, customize, and save their own theme with custom primary colors, card radii, and surface textures.

### 3. 🌐 Bhasha Engine (Multilingual Localization)
* Native support for **6 Indian Regional Languages** plus English:
  * English (`en`)
  * हिन्दी (Hindi — `hi`)
  * বাংলা (Bengali — `bn`)
  * मराठी (Marathi — `mr`)
  * தமிழ் (Tamil — `ta`)
  * తెలుగు (Telugu — `te`)
  * ಕನ್ನಡ (Kannada — `kn`)
* Instant runtime language switching with full string coverage across navigation, widgets, and settings.

### 4. 📊 18 Persona-Driven Weather Widgets
* High-precision metrics grounded in live Open-Meteo and IMD data models:
  * **Essential**: Current Summary, Hourly Rain Timeline, Extended Forecast.
  * **Health & Wellness**: Air Quality Index (AQI with PM2.5/PM10), UV Index, Pollen Estimate.
  * **Fitness & Outdoors**: Best Running Hours, Sunrise & Sunset Times, Comfort Index.
  * **Marine & Coastal**: Douglas Sea State Scale, High/Low Tide Timings.
  * **Travel & Commute**: Destination City Weather, Smart Packing Tips, School Commute Window, Visibility & Fog Alert.
  * **Agriculture**: Soil Moisture Index, Frost Risk Detection, Rainfall Forecast.

---

## 🏗️ Architecture & Documentation

Before contributing or reviewing, consult the comprehensive documentation suite in `docs/` and `designs/`:

* [`docs/01-PRD.md`](docs/01-PRD.md): Product Requirements, User Stories & Widget Inventory.
* [`docs/02-TRD.md`](docs/02-TRD.md): Technical Requirements, Persona Vector Algorithms & Data Architecture.
* [`docs/03-APP_FLOW.md`](docs/03-APP_FLOW.md): Screen-by-Screen Navigation & State Transition Flows.
* [`docs/04-FRONTEND.md`](docs/04-FRONTEND.md): Frontend Architecture, Component Contracts & Layout Engine.
* [`docs/05-COMPANION.md`](docs/05-COMPANION.md): Technical Specification for Mimi (Priority Engine, Gaze System, State Machine).
* [`designs/THEME_SYSTEM.md`](designs/THEME_SYSTEM.md): Dynamic Theme Architecture, Tokens & Art Directions.

---

## 🛠️ Tech Stack

* **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (Expo Router v54+)
* **State Management**: [Zustand](https://github.com/pmndrs/zustand) with `@react-native-async-storage/async-storage` persistence
* **Vector Graphics**: `react-native-svg`
* **Lists & Drag Reorder**: `react-native-draggable-flatlist` & `react-native-reanimated`
* **Backend & Sync**: [Supabase](https://supabase.com/) (PostgreSQL & Edge Functions)
* **Language & Typing**: Strict TypeScript
* **Test Runner**: Node Native Test Runner with `tsx` (`npx tsx --test`)

---

## 🚀 Getting Started

### Prerequisites
* Node.js v18+ (Node 20+ LTS recommended)
* npm or yarn
* Expo CLI (`npm install -g expo-cli` or via `npx expo`)
* Android Studio / Xcode (for device builds or emulators)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/mausam.git
   cd mausam
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```
   Fill in your `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

4. **Start Development Server:**
   ```bash
   npx expo start
   ```

5. **Run on Android / iOS:**
   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```

---

## 🧪 Verification & Code Quality

Run tests and verification commands:

```bash
# Run unit tests
npm test

# Type check
npx tsc --noEmit

# Lint check
npm run lint
```

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
