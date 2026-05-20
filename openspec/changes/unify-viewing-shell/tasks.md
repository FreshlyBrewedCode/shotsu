## 1. Foundation: ProfileContext and Provider Refactoring

- [ ] 1.1 Make `dispatch` and `adapter` optional in `ProfileContextValue` type (`lib/profile-store.tsx`)
- [ ] 1.2 Audit all `ProfileContext` consumers to handle optional `dispatch`/`adapter` without crashing
- [ ] 1.3 Remove `undefined as unknown` casts from `app/view/page.tsx` and `app/view/sets/[id]/page.tsx` (will be replaced later)
- [ ] 1.4 Create `PublishedProfileProvider` component (`lib/published-profile-provider.tsx`) that fetches profile + sets and wraps children in `ProfileContext.Provider` + `PhotoResolver.Provider`
- [ ] 1.5 Verify `PublishedProfileProvider` handles fetch errors with a visible error state

## 2. Unified Shell Components

- [ ] 2.1 Create `ProfileShell` component (`components/profile-shell.tsx`) that renders `ProfileHeader` + `ContentSection` with `SetCard` grid
- [ ] 2.2 Add `makeSetHref` prop to `ProfileShell` so links are relative to the current route context
- [ ] 2.3 Create `SetShell` component (`components/set-shell.tsx`) that renders `SetViewer` and conditionally overlays edit chrome
- [ ] 2.4 Make `SetShell` accept `setId` and `isEditing` props, reading state from `ProfileContext`
- [ ] 2.5 Ensure `SetShell` gracefully handles `dispatch` being `undefined` (published mode)
- [ ] 2.6 Verify `SetShell` scroll behavior: no `window.scrollTo(0,0)` on search param changes

## 3. Nav Adaptation and Layout Restructuring

- [ ] 3.1 Remove `ProfileProviderWrapper` from `app/layout.tsx` (keep only fonts, HTML shell)
- [ ] 3.2 Delete `components/profile-provider-wrapper.tsx`
- [ ] 3.3 Create `app/(local)/layout.tsx` that wraps children in `ProfileProvider` + `Nav`
- [ ] 3.4 Update `Nav` (`components/nav.tsx`) to check `dispatch` before rendering create-set button
- [ ] 3.5 Update `Nav` profile link to point to `/me` instead of `/profile`
- [ ] 3.6 Update `Nav` so published mode does not show the "+" create-set button
- [ ] 3.7 Update `PublishButton` link from `/view?url=...` to continue working with new route structure

## 4. Local Route Migration (/profile → /me, /sets/[id]/edit → merged)

- [ ] 4.1 Move `app/profile/page.tsx` to `app/(local)/me/page.tsx` and refactor to use `ProfileShell` with `makeSetHref={(id) => `/me/sets/${id}`}`
- [ ] 4.2 Move `app/sets/page.tsx` to `app/(local)/sets/page.tsx` and update links from `/profile` to `/me`
- [ ] 4.3 Move `app/sets/[id]/page.tsx` to `app/(local)/me/sets/[id]/page.tsx`
- [ ] 4.4 Refactor `app/(local)/me/sets/[id]/page.tsx` to use `SetShell` with `isEditing={searchParams.get("mode") === "edit"}`
- [ ] 4.5 Merge `app/sets/[id]/edit/page.tsx` logic into `SetShell` (edit chrome: `EditToolbar`, `EditContextMenuOverlay`, file input, inline title)
- [ ] 4.6 Delete `app/sets/[id]/edit/page.tsx` route entirely
- [ ] 4.7 Wrap `app/(local)/me/sets/[id]/page.tsx` in `EditProvider` unconditionally
- [ ] 4.8 Update `Nav` create-set navigation from `/sets/{id}/edit` to `/me/sets/{id}?mode=edit`
- [ ] 4.9 Update `SetCard` default links to point to `/me/sets/${set.id}` instead of `/sets/${set.id}`

## 5. Published Route Migration (/view → unified shell)

- [ ] 5.1 Move `app/view/page.tsx` to `app/(published)/view/page.tsx`
- [ ] 5.2 Refactor `app/(published)/view/page.tsx` to use `PublishedProfileProvider` + `ProfileShell` instead of inline fetch logic
- [ ] 5.3 Move `app/view/sets/[id]/page.tsx` to `app/(published)/view/sets/[id]/page.tsx`
- [ ] 5.4 Refactor `app/(published)/view/sets/[id]/page.tsx` to use `PublishedProfileProvider` + `SetShell`
- [ ] 5.5 Create `app/(published)/layout.tsx` if needed for shared wrapper (or leave individual pages wrapping their own provider)
- [ ] 5.6 Verify `/view?url=...` still loads and renders published profiles correctly
- [ ] 5.7 Verify `/view/sets/[id]?url=...` still loads individual published sets

## 6. Username Registry and /p/<username> Routes

- [ ] 6.1 Create `lib/registry.ts` with hard-coded `REGISTRY: Record<string, string>` and `resolveUsername()` export
- [ ] 6.2 Create `app/(published)/p/[username]/layout.tsx` (Server Component) that validates username via `resolveUsername` and calls `notFound()` if unknown
- [ ] 6.3 The layout wraps children in `PublishedProfileProvider` with the resolved base URL + `Nav`
- [ ] 6.4 Create `app/(published)/p/[username]/page.tsx` that renders `ProfileShell` with `makeSetHref={(id) => `/p/${username}/sets/${id}`}`
- [ ] 6.5 Create `app/(published)/p/[username]/sets/[id]/page.tsx` that renders `SetShell` (always `isEditing={false}` because `dispatch` is undefined)
- [ ] 6.6 Verify navigating to `/p/demo` (or other registry entry) renders the published profile
- [ ] 6.7 Verify navigating to `/p/nonexistent` returns a 404

## 7. E2E Test Updates

- [ ] 7.1 Update `e2e/publish.spec.ts` routes from `/profile` to `/me`
- [ ] 7.2 Update `e2e/publish.spec.ts` routes from `/sets/[id]/edit` to `/me/sets/[id]?mode=edit`
- [ ] 7.3 Update `e2e/publish.spec.ts` `/view?url=...` assertions to match new route group structure
- [ ] 7.4 Update any other e2e tests referencing old routes (`/profile`, `/sets/[id]/edit`)
- [ ] 7.5 Add e2e test: navigate to `/me/sets/[id]`, click Edit button, verify URL becomes `?mode=edit` without page reload
- [ ] 7.6 Add e2e test: navigate to `/p/demo` and verify published profile renders (if test data available)
- [ ] 7.7 Run full e2e suite and fix failures

## 8. Cleanup and Verification

- [ ] 8.1 Delete old route directories: `app/profile/`, `app/sets/[id]/edit/`, `app/sets/[id]/page.tsx` (if not already moved), `app/sets/page.tsx` (if not already moved)
- [ ] 8.2 Verify no stale imports reference old route paths
- [ ] 8.3 Verify `app/sets/` directory only contains `page.tsx` (the all-sets list) after migration
- [ ] 8.4 Verify `next.config.ts` has no route rewrites needed (we are not adding redirects)
- [ ] 8.5 Run `npm run build` and fix any TypeScript or build errors
- [ ] 8.6 Manual smoke test: create set → add photo → view set → click Edit → edit title → navigate back to /me → publish → view published at /view?url=...
