# Mausam Theme System

## Core Principle: Infinite Customization

Mausam is built around the idea of **Infinite Customization**. 

A user's initial onboarding survey generates a **Persona** (a data profile indicating their interests). This persona is used to recommend a starting set of widgets and a starting **Theme**.

However, **Persona ≠ Theme**.

*   **Persona** controls the **DATA** (which widgets are relevant, what alerts are shown, default layout).
*   **Theme** controls the **PRESENTATION** (colors, typography, shapes, shadows, motion).

These two concepts are strictly decoupled. A user whose persona is "Agriculture" can freely select the "Apple Liquid" or "Beach" theme. The UI must adapt completely without breaking functionality.

## Architectural Approach

To achieve true extensibility, the React Native application will transition from static theme imports to a dynamic theme provider architecture.

### The `MausamTheme` Interface

Every theme in the `designs/themes/` directory will eventually map to a TypeScript object implementing a strict `MausamTheme` interface. 

The interface encompasses:
*   **metadata**: ID, name, author, intended feel.
*   **colors**: Background, surface, primary, text, textSecondary, border, semantic (success/warning/error), and specialized weather-context colors.
*   **typography**: Font families, weights, and modular scales.
*   **spacing**: Base units (xs, s, m, l, xl, xxl) to enforce rhythm.
*   **shapes**: Border radii (small, medium, large, pill).
*   **cards**: Elevation, shadow opacities, border widths.
*   **motion**: Spring configurations for transitions.

### Integration with Existing App

Currently, the app uses static imports (`import { colors } from '../../theme/colors'`). 

When implementing the Theme System, this will migrate to a **Provider Pattern**:

1.  **Zustand Store (`useThemeStore`)**: Will hold the active `themeId` and the resolved `MausamTheme` object.
2.  **Custom Hook (`useTheme`)**: Will be used inside components to access the active theme.
    ```tsx
    const { colors, shapes } = useTheme();
    ```
3.  **Widget Independence**: Widgets will *never* contain hardcoded hex codes. A `WeatherWidget` will render exactly the same component tree for "Liquid" as it does for "Retro", relying entirely on the provided `colors` and `shapes` to change its appearance.

### The Themes

The default themes defined in the system are:

**General Purpose**
*   **Apple Liquid**: Premium, translucent, soft glassmorphism.
*   **Retro Peaceful 2D**: Flat, nostalgic, warm, low-stress.
*   **Custom**: A clean, highly neutral baseline intended for users building their layout from scratch.

**Persona-Oriented**
*   **Health**: Crisp, clinical, breathable, data-dense.
*   **Fitness**: High-contrast, energetic, dark-mode biased.
*   **Beach**: Bright, breezy, fluid, organic shapes.
*   **Travel**: Structured, ticket-like, cosmopolitan.
*   **Parent**: Soft, reassuring, accessible, color-coded safety.
*   **Agriculture**: Earthy, rugged, practical, high legibility.
*   **Commuter**: Utilitarian, fast, neon accents on dark backgrounds for transit.
*   **Event**: Elegant, calendar-like, sophisticated.
