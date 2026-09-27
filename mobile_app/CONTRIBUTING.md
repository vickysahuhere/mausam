# Contributing to Mausam

Thank you for your interest in contributing to Mausam! We are building a personalized, infinitely customizable weather experience.

## Before You Start

Mausam has a specific architectural philosophy. Before writing code, you **must** read:
1. \docs/01-PRD.md\ (Product constraints and goals)
2. \designs/THEME_SYSTEM.md\ (The separation of Personas and Themes)

Understanding that **Personas dictate data/widgets** and **Themes dictate presentation** is critical to getting a PR approved.

## Setup Instructions

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Run \
pm install\ to install dependencies.
4. Copy \.env.example\ to \.env\ and add your public testing keys.
5. Verify the app runs locally via \
px expo start --android\.

## Branching Strategy

- Create a descriptive branch from \main\.
- Use the format: \eature/short-description\ or \ugfix/issue-description\.
- Example: \git checkout -b feature/aqi-widget\

## Code Quality Requirements

To ensure a stable codebase, all submissions must pass our quality checks. Before submitting a PR, run the following locally:

1. **Type Checking:** 
   \\\ash
   npx tsc --noEmit
   \\\
   Your PR must have **0 TypeScript errors**. Do not use \ny\ unless strictly necessary.

2. **Linting:**
   \\\ash
   npm run lint
   \\\
   Your PR must have **0 ESLint warnings or errors**.

3. **Architectural Constraints:**
   - Do not hardcode hex colors in widget components. Use the \useTheme()\ hook.
   - Do not put business logic or API calls inside UI presentation components.
   - Never commit private API keys or \.env\ files.

## Submitting Changes

1. Commit your changes with clear, descriptive commit messages.
2. Push your branch to your fork.
3. Open a Pull Request against the \main\ branch of the upstream repository.
4. Include screenshots or videos in your PR description if you modified the UI.
5. Request a review from the maintainers.

Thank you for helping us build Mausam!
