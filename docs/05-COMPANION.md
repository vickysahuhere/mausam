# Mimi — The Living Weather Companion (???? ????)
## Technical Specification & Architecture Document

---

## 1. Executive Summary & Character Philosophy

Mimi is an interactive, weather-aware character embedded directly into Mausam's primary interface.
* **Mimi is NOT a chatbot**: Mimi does not engage in endless conversational text generation, demand text input, or clutter the screen with dialogues.
* **Mimi is NOT a static or purely decorative mascot**: Mimi observes atmospheric events, live weather metrics, time of day, user scroll behavior, and gesture interactions, then responds through expressive vector animations, gaze shifts, pose adjustments, and deterministic personality remarks.
* **Inspiration**: Inspired by the charm of responsive desktop mascots (e.g., Bongo Cat), but elevated to a fully context-aware, living mobile companion.

---

## 2. System Architecture

The companion subsystem is completely decoupled from the rendering components via a type-safe event bus and priority engine:

```
+------------------------------------------------------------------------+
¦                        MAUSAM APPLICATION                              ¦
¦                                                                        ¦
¦   +---------------------+             +----------------------------+   ¦
¦   ¦ Open-Meteo Weather  ¦             ¦   User Gestures & Scrolls  ¦   ¦
¦   +---------------------+             +----------------------------+   ¦
¦              ¦                                      ¦                  ¦
¦              ?                                      ?                  ¦
¦   +----------------------------------------------------------------+   ¦
¦   ¦               CompanionEventBus (companionEvents.ts)           ¦   ¦
¦   +----------------------------------------------------------------+   ¦
¦                                  ¦                                     ¦
¦                                  ?                                     ¦
¦   +----------------------------------------------------------------+   ¦
¦   ¦                 Companion Brain & Priority Engine              ¦   ¦
¦   ¦   • 5-Level Preemption Engine (Level 1: Ambient to Level 5)    ¦   ¦
¦   ¦   • Gaze Direction Resolver (User, Left, Right, Up, Down)      ¦   ¦
¦   ¦   • Weather Transition Detection (Rain, Storm, Clear)          ¦   ¦
¦   ¦   • Behavioral Pattern Tracking (Refreshes, Temp Taps, Locs)   ¦   ¦
¦   ¦   • Contextual Remarks Catalog with 5-Message Ring Buffer      ¦   ¦
¦   +----------------------------------------------------------------+   ¦
¦                                  ¦                                     ¦
¦                                  ?                                     ¦
¦   +----------------------------------------------------------------+   ¦
¦   ¦              Zustand Store (useCompanionStore.ts)              ¦   ¦
¦   ¦   • Persistent Affinity (1-10) • Inactivity Timers (Tiers 1-5) ¦   ¦
¦   ¦   • Single-Tap Instant Wake Progression                        ¦   ¦
¦   +----------------------------------------------------------------+   ¦
¦                                  ¦                                     ¦
¦                                  ?                                     ¦
¦   +----------------------------------------------------------------+   ¦
¦   ¦      Vector SVG Rig (MausamCatSvg.tsx & CompanionPerch.tsx)    ¦   ¦
¦   ¦   • Dynamic Pupils & Head Tilt • Bongo Paws • Live Accessories ¦   ¦
¦   ¦   • Embroidered Silk Sleeping Eye Mask • Floating zZZ Particles¦   ¦
¦   +----------------------------------------------------------------+   ¦
+------------------------------------------------------------------------+
```

---

## 3. The 5-Level Priority & Preemption Engine

Reactions strictly obey the **Single Coherent Reaction Rule** (reactions never overlap or fight):

| Priority Level | Score | Trigger Categories | Behavior & Override Rules |
|---|---|---|---|
| **Level 5: CRITICAL** | **100** | Severe weather alerts (`severe_alert_triggered`), active thunderstorms | Preempts all ongoing states. Mimi tucks ears flat, ducks in protective posture (`duck_hide`), and alerts the user to stay safe indoors. |
| **Level 4: MAJOR** | **80** | Notable weather transitions (Sunny -> Rain, Rain -> Clear), long absence return (>48h) | Preempts direct interactions and idle routines. Equips or unequips rain accessories with speech commentary. |
| **Level 3: INTERACTION** | **65–72** | Direct user taps, petting, treating, manual refresh | Responsive user engagement. Tapping triggers playful bongo drumming or instant wake-up; petting triggers blissful crescent eyes and purring hearts. |
| **Level 2: CONTEXTUAL** | **35–50** | Scroll awareness (`user_scrolled`), temperature checks, UV index warnings, screen navigation | Adjusts gaze direction (looks left at temperature, right at cities, down at scroll content). |
| **Level 1: AMBIENT** | **10–25** | 12 idle routines, tiered inactivity progression, circadian sleep | Gentle background life. Blinking, ear twitches, paw grooming, stretching, and deep sleep. |

---

## 4. Gaze Direction & Attention System

Pupil coordinates and subtle head angles dynamically shift in response to screen interactions:

* **`user`**: Direct eye contact with user during conversations and neutral resting state.
* **`left`**: Pupils offset left (`dx = -2.8`), head tilts -3 deg towards temperature display during temperature checks or tap actions.
* **`right`**: Pupils offset right (`dx = 2.8`), head tilts +3 deg towards live telemetry badges or location switching.
* **`up`**: Pupils offset upward (`dy = -2.5`) inspecting clouds during rain, high UV index, or sky observations.
* **`down`**: Pupils offset downward (`dy = 2.5`) when scrolling through forecast cards, or when dozing off.

---

## 5. Tiered Inactivity & Sleep Architecture

When the user leaves the application open untouched, Mimi transitions through realistic natural stages:

1. **Tier 1 (0–15s)**: Active and alert. Performs occasional random idle routines (stretching, ear twitches, paw patting).
2. **Tier 2 (15–30s)**: Settling. Shifts into a calm seated perch (`pose: 'sit'`).
3. **Tier 3 (30–60s)**: Drowsy. Slow blinks with sleepy half-lidded eyes.
4. **Tier 4 (60–120s)**: Dozing off. Stretches with a yawn (`pose: 'stretch_yawn'`), eyes resting downwards.
5. **Tier 5 (120s+)**: Deep Sleep.
   * Curls up (`pose: 'curl_sleep'`).
   * Equips a **luxurious embroidered silk Sleeping Eye Mask** with golden eyelashes, elastic strap, and crescent moon motif.
   * Emits floating zZZ dream particles.

### Instant Single-Tap Awakening
Tapping Mimi while she is sleeping immediately wakes her up without multi-step delays:
* Instantly removes the sleeping eye mask.
* Stretches with a refreshing yawn (`pose: 'stretch_yawn'`).
* Resets the inactivity timer to active state.
* Delivers a charming wake remark (e.g., *"Is something happening?"* or *"Yawn... what did I miss?"*).

---

## 6. Personality Catalog & Behavioral Intelligence

### Categorized Remarks Catalog (`lib/companion/companionRemarks.ts`)
Contains 21 deterministic categories:
`general`, `weather_rain`, `weather_heat`, `weather_cold`, `weather_uv`, `weather_wind`, `weather_storm`, `repeated_refresh`, `repeated_temp`, `repeated_location`, `repeated_tap`, `returning_short`, `returning_long`, `returning_very_long`, `inactivity_nap`, `wake_up`, `time_morning`, `time_night`, `late_night_3am`, `easter_egg`, and `self_aware`.

### 5-Message Ring Buffer
Mimi tracks the last 5 remark IDs delivered. `selectContextualRemark()` filters out recently spoken messages to guarantee speech remains rare, delightful, and non-repetitive.

### User Behavioral Intelligence
* **Repeated Refreshes**: If the user pulls to refresh 3+ times in one session, Mimi observes: *"Still waiting for the weather to change?"* or *"You refreshed 3 times! It is still the same sky."*
* **Repeated Temperature Checks**: If temperature is tapped 3+ times: *"It is still the exact same temperature."* or *"Tapping it does not make it warmer!"*
* **Frequent City Switching**: If switching locations 3+ times: *"Checking every city on the map?"* or *"Pack your bags, I guess!"*
* **Absence Intelligence**:
  * Return after >48h: *"I was starting to think you moved."*
  * Return after >8h: *"Where have you been?"*
  * Late night (1:00 AM – 5:00 AM): *"Why are YOU awake? Go to sleep! The clouds will still be here."*

---

## 7. Performance & Vector Implementation

* **Zero External Media Dependencies**: Mimi is rendered entirely via `react-native-svg` paths, ellipses, circles, and gradients. No heavy animated GIFs, WebP files, or video loops.
* **Native Driver Animations**: Tail oscillations, head breathing bobs, and paw tapping execute on the UI thread via `useNativeDriver: true`.
* **Zero Network Latency**: Offline deterministic state machine; zero LLM token costs or API latency.
