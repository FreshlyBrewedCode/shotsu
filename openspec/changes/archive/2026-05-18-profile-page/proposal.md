## Why

The app already stores profile data (name, sets list) in IndexedDB via the `local-profile-state` system, but users have no way to view or manage their profile. A dedicated profile page is needed so users can see their identity, manage their name, bio, and avatar, and browse their created sets — turning the stored state into a usable UI.

## What Changes

- Add a new `/profile` route that renders the user's profile page with an Instagram-like layout: avatar, name, bio at the top; content sections below.
- Add a `/sets` route that renders a full vertical grid of all sets (3→1 column responsive).
- Extend the `Profile` data model with `bio` (string) and `avatarPhotoId` (nullable string referencing a photo in the catalog).
- Extend the `Set` data model with `coverPhotoId` (nullable string referencing a photo in the catalog). UI falls back to the first photo in the set.
- Provide inline name and bio editing via new dispatch actions.
- Provide avatar selection using the existing photo catalog and ingest pipeline.
- Render a reusable `ContentSection` component for horizontally-scrolling previews (mobile) and fixed-row previews (desktop).
- Render `SetCard` components inside content sections with cover images, titles, and an empty-state when there are no photos.
- The page SHALL use the existing `ProfileProvider` context (already wrapped in `layout.tsx`) — no new data layer.

## Capabilities

### New Capabilities
- `profile-page`: UI for viewing and editing the user profile (avatar, name, bio), and browsing set previews in `ContentSection` rows.
- `sets-list-page`: Full vertically-scrolling grid page at `/sets` for viewing all sets.
- `content-section`: Reusable horizontally-scrolling (mobile) / fixed-row (desktop) section component with a title and an action slot.
- `set-card`: Reusable card component displaying a set cover image, title, and empty-state.

### Modified Capabilities
- `local-profile-state`: Add `bio`, `avatarPhotoId` to `Profile` type; add `coverPhotoId` to `Set` type; add `UPDATE_PROFILE_NAME`, `UPDATE_PROFILE_BIO`, `UPDATE_PROFILE_AVATAR` dispatch actions; add `SET_COVER` dispatch action.

## Impact

- New files: `app/profile/page.tsx`, `app/sets/page.tsx`
- New components: `components/profile-header.tsx`, `components/content-section.tsx`, `components/set-card.tsx`
- Modified: `lib/types.ts`, `lib/profile-store.tsx`
- Reuses existing `useProfile` hook and dispatch actions
- Navigation link from landing page or toolbar to `/profile`
