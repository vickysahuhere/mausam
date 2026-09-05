# Mausam

Mausam is an open-source, highly customizable React Native weather application , designed such that  for the Indian Meteorological Department (IMD) for SIH 2026 / general weather usage. It generates a personalized dashboard based on user personas and allows infinite customization of weather widgets, themes, and layouts.

## ?? Project Overview

Unlike traditional weather apps that show the same data to everyone, Mausam uses an onboarding survey to build a **Persona Vector**. This vector recommends a starting theme and a specific layout of widgets (e.g., AQI for health-conscious users, wave heights for beachgoers). 

Mausam follows the principle of **Infinite Customization**: personas do not lock you in. You can mix widgets, select any theme, and build a completely custom weather dashboard.

## ?? Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (Expo Router)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with AsyncStorage persistence)
- **Backend/Database**: [Supabase](https://supabase.com/) (Edge Functions, Postgres)
- **Language**: TypeScript

## ?? Documentation

Before contributing, please read the architectural and product documentation in the docs/ and designs/ directories:
- \docs/01-PRD.md\: Product Requirements & Goals
- \docs/02-TRD.md\: Technical Requirements & Persona Algorithm
- \docs/03-APP_FLOW.md\: Navigation & Screen Flow
- \docs/04-FRONTEND.md\: Frontend Architecture
- \designs/THEME_SYSTEM.md\: Dynamic Theme Architecture
- \AGENTS.md\: AI Agent instructions

## ?? Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm or yarn
- Expo CLI (\
pm install -g expo-cli\)
- Android Studio / Emulator (for local Android development)

### Installation

1. **Clone the repository:**
   \\\ash
   git clone https://github.com/your-org/mausam.git
   cd mausam
   \\\

2. **Install dependencies:**
   \\\ash
   npm install
   \\\

### Environment Setup

Mausam requires environment variables to connect to services like Supabase.

1. Copy the example environment file:
   \\\ash
   cp .env.example .env
   \\\
   *(On Windows PowerShell, use: \Copy-Item .env.example .env\)*

2. Open \.env\ and replace the placeholder values with your actual \EXPO_PUBLIC_*\ configuration. 
   > **Security Note:** Never commit your \.env\ file or expose private backend secrets (e.g., Supabase \service_role\ keys) in client-side code.

### Running the App

To start the Expo development server:
\\\ash
npx expo start
\\\

To run directly on an Android emulator:
\\\ash
npx expo start --android
\\\

## ?? Contribution Expectations

We welcome community contributions! Please review \CONTRIBUTING.md\ before submitting a Pull Request. Contributors are expected to:
1. Understand the **Infinite Customization** product principle.
2. Ensure code is strictly typed and passes all TypeScript checks (\
px tsc --noEmit\).
3. Ensure no linting errors are present (\
pm run lint\).
4. Keep themes decoupled from widget business logic.

## ?? License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
