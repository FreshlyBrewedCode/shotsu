## 1. Dependency and Configuration Setup

- [x] 1.1 Remove Next.js dependencies: `next`, `eslint-config-next`, `@types/node` (if unused). Remove `next-env.d.ts`.
- [x] 1.2 Add Vite and React Router dependencies: `vite`, `@vitejs/plugin-react`, `react-router` (or `react-router-dom`).
- [x] 1.3 Add font dependency: `@fontsource/lora` (and `@fontsource/inter` if desired).
- [x] 1.4 Create `vite.config.ts` with React plugin and `@/` alias resolving to `./src`.
- [x] 1.5 Create `index.html` at project root with a single `<div id="root"></div>` and script tag pointing to `src/main.tsx`.
- [x] 1.6 Update `tsconfig.json` if needed to ensure `paths` aligns with Vite alias.

## 2. Entry Points and Router Scaffold

- [x] 2.1 Create `src/main.tsx`: mount React root to `#root`, import `src/App.tsx`.
- [x] 2.2 Create `src/App.tsx`: set up `BrowserRouter` with route definitions.
- [x] 2.3 Create centralized route config mapping all existing routes:
  - `/` → HomePage
  - `/me` → MePage
  - `/me/sets/:id` → MeSetPage
  - `/sets` → SetsPage
  - `/p/:username` → PublishedProfilePage
  - `/p/:username/sets/:id` → PublishedSetPage
  - `/view` → ViewPage
  - `/view/sets/:id` → ViewSetPage
- [x] 2.4 Create `src/RootLayout.tsx` (or equivalent) replacing `app/layout.tsx`: HTML root, font CSS variables, global CSS import.

## 3. Page and Layout Migration

- [x] 3.1 Migrate `app/page.tsx` → `src/pages/HomePage.tsx`. Replace `next/link` with React Router `Link`.
- [x] 3.2 Migrate `app/(local)/layout.tsx` → `src/local/LocalLayout.tsx` or as a route layout wrapper. Remove `next/navigation` usage.
- [x] 3.3 Migrate `app/(local)/me/page.tsx` → `src/pages/MePage.tsx`. Replace `useRouter` with React Router `useNavigate`.
- [x] 3.4 Migrate `app/(local)/me/sets/[id]/page.tsx` → `src/pages/MeSetPage.tsx`. Replace `useParams`/`useSearchParams` with React Router equivalents.
- [x] 3.5 Migrate `app/(local)/sets/page.tsx` → `src/pages/SetsPage.tsx`.
- [x] 3.6 Migrate `app/(published)/p/[username]/page.tsx` → `src/pages/PublishedProfilePage.tsx`. Convert async server component to regular client component; move `resolveUsername` to client-side.
- [x] 3.7 Migrate `app/(published)/p/[username]/layout.tsx` → route-level layout or inline provider setup in `PublishedProfilePage`.
- [x] 3.8 Migrate `app/(published)/p/[username]/sets/[id]/page.tsx` → `src/pages/PublishedSetPage.tsx`.
- [x] 3.9 Migrate `app/(published)/view/page.tsx` → `src/pages/ViewPage.tsx`. Replace `useSearchParams` with React Router version.
- [x] 3.10 Migrate `app/(published)/view/sets/[id]/page.tsx` → `src/pages/ViewSetPage.tsx`.

## 4. Component and Lib Migration

- [x] 4.1 Migrate `components/nav.tsx`: Replace `next/link` → `react-router-dom/Link`, `useRouter` → `useNavigate`.
- [x] 4.2 Migrate `components/profile-shell.tsx`: Replace `next/link` → `react-router-dom/Link`.
- [x] 4.3 Migrate `components/set-shell.tsx`: Replace `next/link` → `react-router-dom/Link`.
- [x] 4.4 Search entire codebase for remaining `next/*` imports and replace or remove them.
- [x] 4.5 Move `app/globals.css` → `src/globals.css` and ensure it's imported by `RootLayout` or `main.tsx`.
- [x] 4.6 Move `components/` → `src/components/`, `lib/` → `src/lib/`. Update all internal imports to use `@/` alias.

## 5. Font and Style Migration

- [x] 5.1 Remove `next/font/google` imports from `RootLayout`.
- [x] 5.2 Add `@fontsource/lora` import in `main.tsx` or `globals.css`.
- [x] 5.3 Add Inter font loading (either `@fontsource/inter` or CSS `@import` in `globals.css`).
- [x] 5.4 Preserve CSS font variables (`--font-sans`, `--font-heading`) so Tailwind theme continues to work.

## 6. Build and Test Verification

- [x] 6.1 Update `package.json` scripts: `dev` → `vite`, `build` → `vite build`, `preview` → `vite preview`.
- [x] 6.2 Run `npm run dev` and manually verify all routes load correctly.
- [x] 6.3 Run `npm run build` and verify `dist/` output contains a single `index.html` and hashed JS/CSS assets.
- [x] 6.4 Run `npm run test:unit` (Vitest) and fix any broken imports or environment issues.
- [x] 6.5 Update `playwright.config.ts` `baseURL` from `http://localhost:3000` to `http://localhost:5173`.
- [ ] 6.6 Run `npm run test:e2e` (Playwright) and fix any test failures caused by routing or navigation changes.

## 7. Cleanup

- [x] 7.1 Delete `app/` directory and all subdirectories.
- [x] 7.2 Delete `next.config.ts`.
- [x] 7.3 Delete any remaining Next.js-specific files (`.next/` in `.gitignore`, etc.).
- [x] 7.4 Verify no orphaned imports or references to `next` anywhere in the source.
- [ ] 7.5 Run full test suite one final time (`test:unit` + `test:e2e`).
