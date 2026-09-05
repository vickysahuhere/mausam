# Frontend Document
## Mausam — Personalized Homepage (React Native / Expo)

---

## 1. Folder Structure

```
/app
  /navigation
    RootNavigator.tsx
    OnboardingStack.tsx
    MainTabs.tsx
  /screens
    /onboarding
      SplashScreen.tsx
      LandingScreen.tsx
      AuthScreen.tsx
      SurveyScreen.tsx        -- multi-step, driven by /lib/surveyQuestions.ts
      LocationSetupScreen.tsx
    /home
      HomeScreen.tsx
      CustomizeOverlay.tsx
      WidgetLibrarySheet.tsx
    AlertsScreen.tsx
    LocationsScreen.tsx
    SettingsScreen.tsx
  /components
    /widgets
      BaseRow.tsx
      AqiCard.tsx
      PollenEstimate.tsx
      UvIndex.tsx
      BestRunHours.tsx
      SunriseSunset.tsx
      SeaState.tsx
      TideTimes.tsx
      DestinationWeather.tsx
      PackingTip.tsx
      SchoolCommute.tsx
      RainTimeline.tsx
      FrostAlert.tsx
      RainfallForecast.tsx
      SoilMoisture.tsx
      VisibilityFog.tsx
      ExtendedForecast.tsx
      ComfortIndex.tsx
      AlertBanner.tsx
    WidgetCard.tsx        -- shared shell (title, loading, error, content)
    GridRenderer.tsx      -- reads layout, renders widgets in order
  /lib
    personaEngine.ts      -- buildPersonaVector, scoreWidget, selectTopWidgets
    derived.ts            -- bestRunningHours, comfortIndex, frostAlert
    api.ts                -- typed client for Supabase Edge Functions
    cache.ts              -- AsyncStorage/SQLite read/write helpers
    surveyQuestions.ts    -- question bank + SURVEY_WEIGHTS
    widgetRegistry.ts     -- WIDGET_PERSONA_RELEVANCE + widget metadata
  /store
    useAuthStore.ts        -- Zustand: session, guest mode
    useLayoutStore.ts       -- Zustand: current layout, customize mode
    useLocationStore.ts     -- Zustand: saved locations, default location
  /theme
    colors.ts
    spacing.ts
    typography.ts
```

## 2. Widget Component Contract

Every widget takes the same prop shape so `GridRenderer` never needs special-case logic:

```tsx
type WidgetProps<T> = {
  title: string;
  data: T | null;
  loading: boolean;
  error: string | null;
};

// Example
function AqiCard({ title, data, loading, error }: WidgetProps<AqiData>) {
  if (loading) return <WidgetCard title={title}><Skeleton /></WidgetCard>;
  if (error)   return <WidgetCard title={title}><ErrorState message={error} /></WidgetCard>;
  return (
    <WidgetCard title={title}>
      <Text>{data.aqi} AQI · {data.pm25} PM2.5</Text>
    </WidgetCard>
  );
}
```

`WidgetCard` is the shared shell: consistent padding, title row, and drag handle (visible only in customize mode) — every widget wraps its content in it so the grid looks consistent regardless of which widgets a given persona sees.

## 3. Grid Renderer Behavior

- Reads `useLayoutStore`'s current layout (array of `{ widgetId, position, size }`).
- If no saved layout exists yet (fresh user, survey just completed): falls back to `selectTopWidgets(vector, n)` output as a temporary in-memory layout, and offers a "Save this layout" affordance the first time the user edits it.
- Renders `BaseRow` first, unconditionally, then the rest of the widgets in position order.
- Each widget fetches its own data independently (via a small `useWidgetData(widgetId, location)` hook) so a failure in one never blocks siblings.

## 4. Data Fetching Pattern

```tsx
function useWidgetData<T>(endpoint: string, location: LatLon) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>(
    { data: null, loading: true, error: null }
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await readCache(endpoint, location);
      if (cached && !cancelled) setState({ data: cached, loading: false, error: null });

      try {
        const fresh = await fetchFromEdgeFunction(endpoint, location);
        if (!cancelled) {
          setState({ data: fresh, loading: false, error: null });
          writeCache(endpoint, location, fresh);
        }
      } catch (e) {
        if (!cancelled && !cached) setState({ data: null, loading: false, error: 'Unable to load' });
        // if cached data exists, silently keep showing it rather than surfacing the error
      }
    })();
    return () => { cancelled = true; };
  }, [endpoint, location]);

  return state;
}
```

This gives cache-first rendering (instant on repeat visits) with a silent background refresh, and graceful offline fallback per PRD FR8.

## 5. Customize Mode Implementation

- Enter via "Edit" button on Home → sets `useLayoutStore.isCustomizing = true`.
- Use a drag-and-drop list library for React Native (e.g. `react-native-draggable-flatlist`) for reordering.
- Each widget in customize mode shows a remove (✕) icon; tapping opens `WidgetLibrarySheet` to add more.
- "Save" writes the new layout array to Supabase (`user_layouts`) or local storage (guest mode) and exits customize mode.

## 6. Theme Architecture (Dynamic Theme System)

Themes dictate **presentation** (how things look), while Personas dictate **data** (what widgets load). They are strictly decoupled.

- **Theme Interface**: A `MausamTheme` interface must define `colors`, `typography`, `spacing`, `shapes` (radii), `cards` (elevation/shadows), and `motion` (springs).
- **Theme Providers**: The app must use a React Context (`ThemeProvider`) or Zustand store (`useThemeStore`) to provide the *current* theme. UI components (`Button`, `Card`, `Typography`, `WidgetCard`) must consume their styles dynamically via a `useTheme()` hook rather than static imports.
- **Infinite Customization**: Users can select any theme regardless of their persona (e.g., a "Fitness" persona using the "Apple Liquid" theme).
- **Extensibility**: Adding a new theme should simply involve creating a new object that conforms to the `MausamTheme` interface and adding it to the theme registry, requiring zero changes to business logic or widget components.

## 7. What to Hand Your AI Coding Tool

When prompting for new widgets or screens, give it in one shot:
- The `WidgetProps<T>` contract (section 2) — so every new widget matches without drifting.
- The `useWidgetData` hook (section 4) — so new widgets don't reinvent fetching/caching per-component.
- The folder structure (section 1) — so files land in the right place the first time.

This keeps generated code consistent across dozens of AI-assisted prompts instead of every widget being written slightly differently.
