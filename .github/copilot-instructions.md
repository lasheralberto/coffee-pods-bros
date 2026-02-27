# Copilot instructions for coffee-pods-bros

## Project scope and entrypoints
- Work inside `coffee-pods-bros/coffee-pods-bros` (the app is nested one level below the cloned folder).
- App bootstrap: `src/main.tsx` → `src/App.tsx`.
- Routing is `react-router-dom` with `BrowserRouter` and route pages in `src/pages/*`.
- Global shell is `src/components/layout/Layout.tsx` (Navbar, Footer, quiz modal, sticky mobile CTA).
-Always user a local texts.ts file for copy and labels in Spanish and English, located in `src/data/texts.ts`. This file is the source of truth for all user-facing strings; do not hardcode new strings directly in components.

## Architecture and data flow (important)
- Core product flow is the quiz:
  - Question definitions: `src/data/quizQuestions.ts`.
  - State/actions: `src/stores/quizStore.ts` (Zustand).
  - Mapping answers to product: `src/data/matchingRules.ts` (`calculateProfile`).
  - UI orchestration: `src/components/quiz/QuizModal.tsx` and `QuizResult.tsx`.
- Many components trigger quiz opening via `useQuizStore().actions.openQuiz` (Navbar, Hero, Home CTA, sticky CTA).
- Preserve question IDs and answer keys if editing quiz logic; `calculateProfile` depends on numeric IDs (e.g. `answers[3]`, `answers[4]`, `answers[6]`).

## Styling and UI conventions
- Design system is token-driven. Use CSS variables from `src/styles/tokens.css`; do not hardcode new color/font tokens.
- Global styling stack: `src/styles/globals.css` imports `tokens.css`, `components.css`, `animations.css`, and Tailwind v4.
- Reuse UI primitives from `src/components/ui/*` (`Button`, `Section`, `Container`, `Card`, etc.) before creating new primitives.
- Local `cn` helper pattern (`clsx` + `tailwind-merge`) is defined per component; follow existing file style unless doing a deliberate refactor.
- Keep copy and labels in Spanish where existing UI already uses Spanish strings.

## Build, lint, and local workflow
- Install: `npm install` (from `coffee-pods-bros/coffee-pods-bros`).
- Dev server: `npm run dev`.
- Type-check: `npm run lint` (configured as `tsc --noEmit`, not ESLint).
- Production build: `npm run build`.
- `npm run clean` uses `rm -rf dist` (Unix-style); on Windows use manual deletion or adapt command if needed.

## Integration and environment notes
- Vite config (`vite.config.ts`) defines `@` alias to project root and injects `process.env.GEMINI_API_KEY`.
- HMR can be disabled via `DISABLE_HMR=true` in environment; do not remove this behavior.
- Dependency set includes Radix UI + Framer Motion + Zustand; prefer existing stack for dialogs/animation/state.

## Editing guidance for agents
-Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
- Make surgical changes and keep existing component/route structure intact.
- When touching quiz flow, validate end-to-end: open modal, answer single/multi questions, reach result card.
- If `tsc` reports unrelated pre-existing errors, do not refactor broadly; fix only what is in task scope.

## Skills
- Refer to skills/app-rules-skill for guidance on how to apply changes to the codebase. This is your master data source on how to build this app.
- Refer to skills/app-context-skill to update your understanding of the app context, architecture, and recent changes. This is your master data source on the app's current state and structure.