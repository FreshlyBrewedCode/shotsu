## Why

Shotsu is architected as a local-first, client-side application. All data lives in IndexedDB, all mutations happen in the browser, and published profiles are consumed as static JSON over HTTP. Next.js is a server-centric framework that adds complexity (server/client boundaries, API routes, SSR) without providing value for an app that has no server-side data needs. Migrating to Vite with React Router simplifies the build, removes framework friction, and positions the app for future PWA/offline features.

## What Changes

- **BREAKING**: Remove Next.js framework and all App Router conventions (`app/` directory, `layout.tsx`, `page.tsx`, async server components, `next/navigation`, `next/font`).
- Add Vite + `@vitejs/plugin-react` as the build tool and dev server.
- Add React Router v7 (or compatible) for client-side routing.
- Replace Next.js filesystem routing with React Router route definitions.
- Convert the `/p/:username` server component to a client-side route that fetches registry data (registry becomes a separate service in the future; for now, fall back to inline/static resolution or a simple fetch).
- Replace `next/font/google` with `@fontsource` or direct CSS `@import` for fonts.
- Preserve all existing runtime behavior: local profile editing, set creation, photo ingest, publish export, published profile viewing.
- Update build scripts (`package.json`): `dev` → `vite`, `build` → `vite build`, `preview` → `vite preview`.
- Update path alias resolution from `tsconfig.json` `paths` to Vite `resolve.alias`.
- Preserve existing test setup (Vitest + Playwright) — both work with Vite.

## Capabilities

### New Capabilities
<!-- No new user-facing capabilities. This is an infrastructure migration. -->
*(None — this change is purely architectural infrastructure.)*

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
*(None — no spec-level requirements change. All capabilities continue to behave the same for users.)*

## Impact

- **Dependencies**: Remove `next`, `eslint-config-next`, `@types/node` (if unused), `next-env.d.ts`. Add `vite`, `@vitejs/plugin-react`, `react-router`, `@fontsource/lora` (or equivalent).
- **Build output**: Static SPA bundle (`dist/index.html` + assets) instead of Next.js output.
- **Routing**: All routes become client-side. No more SSR or server components.
- **Tests**: Vitest configs may need a Vite-aware plugin or runner. Playwright tests need base URL updated to Vite dev server port.
- **CI/deployment**: Any deployment pipeline using `next build` needs to switch to `vite build`.
