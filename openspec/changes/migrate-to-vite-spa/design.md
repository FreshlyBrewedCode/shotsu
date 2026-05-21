## Context

Shotsu is currently built on Next.js 16 with the App Router. The application has two distinct modes:

1. **Local editing mode** (`/me`, `/me/sets/:id`): Client-side only, using React context providers (`ProfileProvider`, `EditProvider`) backed by IndexedDB.
2. **Published viewing mode** (`/view?url=...`, `/p/:username`): Consumes static JSON profiles over HTTP. `/p/:username` uses a Next.js server component to resolve a hardcoded username registry.

There are no API routes, no server-side data, and no SSR value-add. The Next.js framework introduces unnecessary complexity: server/client boundary rules, async server components, `next/navigation` hooks, and font optimization that can be handled directly.

## Goals / Non-Goals

**Goals:**
- Replace Next.js with Vite as the build tool and dev server.
- Replace Next.js App Router filesystem routing with React Router declarative routes.
- Eliminate all server components and server-side APIs.
- Maintain 100% feature parity — all existing user flows work identically.
- Keep the existing test suite (Vitest + Playwright) passing.

**Non-Goals:**
- Changing any user-facing behavior or UI.
- Modifying the IndexedDB storage layer, profile data model, or export format.
- Adding new features (PWA, service worker, offline mode) — those come after migration.
- Changing the publish/export mechanism.
- Replacing Tailwind v4 or shadcn/ui components.

## Decisions

### Router: React Router v7 (library mode)

**Rationale**: React Router is the de-facto standard for React SPAs. It has excellent TypeScript support, a familiar API (`useParams`, `useSearchParams` which map directly from Next.js), and a large ecosystem. TanStack Router was considered for its type-safe routes, but React Router v7's simplicity and familiarity outweigh the benefit for a small route tree (~8 routes). Wouter was considered for its minimal size, but React Router is still lightweight and provides more robust handling for our nested route needs.

### Build Tool: Vite with `@vitejs/plugin-react`

**Rationale**: Vite is the standard modern build tool for SPAs. It offers fast HMR, simple configuration, and excellent support for React. It also aligns well with Vitest (already in use). Create React App was not considered as it's effectively deprecated.

### Font Loading: `@fontsource/lora` + CSS `@import` for Inter

**Rationale**: Replace `next/font/google` with standard web font loading. `@fontsource` packages are self-hosted and work in any build tool. Inter can be loaded via Google Fonts CSS `@import` in `globals.css` or via `@fontsource/inter` for consistency.

### `/p/:username` Resolution: Client-side fetch with fallback

**Rationale**: The server component currently does `REGISTRY[username]`. In an SPA, this becomes a client-side lookup. For now, the registry can remain a static module (`lib/registry.ts`) imported by the client bundle. In the future, this will be replaced by a separate registry service API call. This is acceptable because the registry is tiny (currently one hardcoded entry) and there is no secret data.

### Route Structure: Centralized route config

**Rationale**: Rather than a file-based router (which would re-introduce filesystem coupling), we'll use a centralized `src/routes.tsx` (or `src/App.tsx`) with explicit `<Route>` definitions. This makes the route tree visible in one place and simplifies refactoring.

### Directory Structure: `src/` convention

**Rationale**: Vite projects conventionally use a `src/` directory. We'll move `app/`, `components/`, `lib/` into `src/` for cleanliness. `public/` stays at root. This is a one-time move that simplifies path aliases (`@/` → `src/`).

```
CURRENT                          FUTURE
───────                          ──────
app/                             src/
  (local)/                         routes.tsx
    layout.tsx                     App.tsx
    me/page.tsx                    main.tsx
    me/sets/[id]/page.tsx          pages/
    sets/page.tsx                    HomePage.tsx
  (published)/                     local/
    p/[username]/page.tsx            LocalLayout.tsx
    p/[username]/layout.tsx          MePage.tsx
    view/page.tsx                    MeSetPage.tsx
    view/sets/[id]/page.tsx          SetsPage.tsx
  layout.tsx                       published/
  page.tsx                           PublishedProfilePage.tsx
  globals.css                        ViewPage.tsx
  sets/                              ViewSetPage.tsx
components/                        components/
  nav.tsx                            nav.tsx
  ...                                ...
lib/                               lib/
  profile-store.tsx                  profile-store.tsx
  ...                                ...
public/                            public/
```

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| **Route migration misses a page** | Map every existing `page.tsx` to a route definition. Audit via `find app -name page.tsx`. |
| **`Link` and `useRouter` references scattered** | Search/replace `next/link` → `react-router-dom`, `next/navigation` → `react-router-dom`. |
| **Tailwind v4 PostCSS config needs Vite alignment** | Vite supports PostCSS out of the box. `postcss.config.mjs` with `@tailwindcss/postcss` should work identically. |
| **Playwright tests depend on Next.js dev server** | Update `playwright.config.ts` baseURL from `http://localhost:3000` to `http://localhost:5173` (Vite default). |
| **Image optimization loss** | Next.js `<Image>` is not used in this codebase (plain `<img>` tags via `Photo` component). No impact. |
| **Font flash / layout shift** | Self-hosted `@fontsource` fonts eliminate external fetch latency and are more predictable than `next/font`. |

## Migration Plan

1. **Install dependencies**: Add `vite`, `@vitejs/plugin-react`, `react-router`, `@fontsource/lora`. Remove `next`, `eslint-config-next`.
2. **Scaffold Vite config**: `vite.config.ts` with React plugin and path alias `@/` → `/src`.
3. **Create entry points**: `index.html` (root), `src/main.tsx` (React root mount), `src/App.tsx` (router setup).
4. **Migrate pages**: Convert each `app/**/page.tsx` to a component in `src/pages/`. Extract layouts from `layout.tsx` files into wrapper components or route-level layout routes.
5. **Replace Next.js APIs**: Update all `next/link` → `react-router-dom/Link`, `next/navigation` → `react-router-dom` hooks.
6. **Migrate fonts**: Replace `next/font` with `@fontsource` imports.
7. **Update package scripts**: `dev` → `vite`, `build` → `vite build`, `preview` → `vite preview`.
8. **Run tests**: Ensure Vitest unit tests pass. Update Playwright base URL and run e2e tests.
9. **Clean up**: Remove `next.config.ts`, `next-env.d.ts`, `app/` directory, any remaining Next.js types.

## Open Questions

- Should we keep `app/` directory name for familiarity, or fully commit to `src/`? (Leaning toward `src/` for Vite conventions.)
- Should we use React Router's data API (`loader`/`action`) or keep data in context providers as-is? (Leaning toward keeping providers — no data-fetching behavior change.)
