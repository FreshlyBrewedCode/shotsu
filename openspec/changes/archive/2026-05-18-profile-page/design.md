## Context

The app already maintains a `Profile` document in IndexedDB containing `id`, `name`, and a `sets` array of `SetSummary` objects (per the `local-profile-state` spec). The `ProfileProvider` context makes this state available to all components via `useProfile`. However, there is currently no UI surface for users to view their profile, edit their name, bio, or avatar, or browse their sets outside of the individual set editor (`/sets/[id]/edit`). The landing page (`/`) is static marketing content.

## Goals / Non-Goals

**Goals:**
- Provide a `/profile` route where users can view and edit their profile (avatar, name, bio).
- Render set previews in a reusable `ContentSection` component: horizontal scroll on mobile, fixed-row preview on desktop.
- Provide a "Show all" link that navigates to `/sets` for a full vertically-scrolling grid.
- Render `SetCard` components with cover images (or empty-state icons).
- Keep styling consistent with the existing minimalist Tailwind design.

**Non-Goals:**
- Photo management or upload (stays in set editor).
- Set metadata editing beyond title and cover (stays in set editor).
- Multiple profiles or authentication.
- Public/sharing features.
- Pagination or search within the sets list (for now — all sets render).

## Decisions

### Reuse `ProfileProvider` — no new data layer
- **Rationale**: The context already provides `state.profile`, `state.sets`, and `dispatch`. Creating a separate data layer would duplicate persistence logic and increase complexity.
- **Alternative considered**: A dedicated `ProfilePage` data fetcher with `useEffect` and direct adapter calls. Rejected because it bypasses the single source of truth and could create stale state.

### Add `UPDATE_PROFILE_NAME`, `UPDATE_PROFILE_BIO`, `UPDATE_PROFILE_AVATAR` actions to existing `profileReducer`
- **Rationale**: The profile fields exist but are immutable via the current dispatch API. The profile page needs to mutate them.
- **Alternative considered**: Direct `adapter.setDoc("profile", ...)` call from the page component. Rejected because it skips the reducer, creating a split-brain state where the in-memory profile and persisted profile diverge until the next INIT.

### Add `coverPhotoId` to `Set` type with UI fallback
- **Rationale**: Users may want an explicit cover image. But a new set starts with zero photos, so the UI must gracefully fall back to the first photo in the set. Storing `coverPhotoId` explicitly on `Set` lets the user override it later.
- **Alternative considered**: A separate `SetMetadata` document. Rejected because it adds a new key scheme and extra fetch without benefit.

### Use Next.js App Router `page.tsx` with `useProfile` hook
- **Rationale**: The `ProfileProvider` is already wrapped in `RootLayout`, so any App Router page can consume the context via a Client Component page. This follows the existing `/sets/[id]/edit/page.tsx` pattern.

### ContentSection as a reusable component with action slot
- **Rationale**: The user wants to reuse this pattern for different categories in the future. Using a render prop / element slot for the header action keeps the component generic.
- **Example usage**:
  ```tsx
  <ContentSection
    title="Your Sets"
    action={<Link href="/sets">Show all</Link>}
  >
    {sets.map(s => <SetCard key={s.id} set={s} />)}
  </ContentSection>
  ```

### Mobile horizontal scroll, desktop fixed-row preview
- **Rationale**: On mobile screen width, a horizontal swipe feels natural and shows ~1.5 cards as a teaser. On desktop, a centered max-width container can show the full preview row without scroll.
- **Breakpoint**: `lg` (1024px) as the divider — below `lg` uses `overflow-x-auto snap-x`, above `lg` uses a plain flex row.

## Risks / Trade-offs

- **[Risk]** Adding new dispatch action types to `profileReducer` is an additive API change. Any future code relying on `ProfileAction` will need to handle them (TypeScript helps here). → **Mitigation**: The changes are additive only; existing action handling is untouched.
- **[Trade-off]** The profile page and sets list page will be Client Components (`"use client"`) because `useProfile` is a client context. This means the pages won't be statically rendered. → **Acceptable**: The data is entirely local/IndexedDB-driven, so SSR provides no benefit here.
- **[Trade-off]** Storing `avatarPhotoId` as a string reference means deleting the underlying photo blob could leave a dangling reference on the profile. → **Mitigation**: For now, photo deletion is not implemented. If added later, a cleanup pass should null out `avatarPhotoId` on profile when the photo is removed.
