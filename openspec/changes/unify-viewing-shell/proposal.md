## Why

The current routing and viewing architecture has two incompatible worlds: local editing at `/profile` and `/sets/[id]/edit`, and published viewing at `/view?url=...`. Set view-to-edit transitions trigger page remounts, scroll resets, and history stack bloat. Published viewer pages fabricate a fake `ProfileContext` inline. The navigation bar always assumes local mode. There is no path toward a username-based registry (`/p/<username>`). We need a unified shell where the same components render local, published, and editing surfaces, with mode determined by provider context rather than route duplication.

## What Changes

- **BREAKING** Rename `/profile` → `/me`. The profile page remains in local/edit mode by default.
- **BREAKING** Rename `/sets/[id]` → `/me/sets/[id]` and `/sets/[id]/edit` → `/me/sets/[id]?mode=edit`. Set pages default to view mode; edit mode is toggled via a search parameter with no page remount.
- **BREAKING** Rename `/sets` (all sets list) → `/sets` stays as a standalone page but links update from `/profile` to `/me`.
- **BREAKING** The `app/layout.tsx` root layout drops all providers. Providers move into route-group layouts: `(local)/layout.tsx` for local editing, `(published)/` subtree layouts for published viewing.
- Introduce `PublishedProfileProvider` — a reusable client component that fetches a published profile over HTTP, constructs a read-only `ProfileContext`, and provides a `PhotoResolver`. Used by both `/view?url=...` and `/p/<username>`.
- Introduce a hard-coded `lib/registry.ts` module mapping usernames to published profile base URLs. This enables experimentation with `/p/<username>` routes before a real backend registry exists.
- Create unified shell components: `ProfileShell` and `SetShell`. `ProfileShell` renders the profile header + sets grid. `SetShell` renders a set in view mode and, when `dispatch` is available, overlays edit chrome (toolbar, context menus) without remounting.
- Adapt `Nav` to be context-aware: hides the create-set button and adjusts profile link when `dispatch` is undefined (published mode).
- Keep `/view?url=...` as a direct-link fallback for testing, but render it through the same `PublishedProfileProvider` + `ProfileShell`/`SetShell` as `/p/<username>`.
- Make `ProfileContextValue.dispatch` and `adapter` optional (`dispatch?`, `adapter?`). Components that need to edit check `if (dispatch)` before rendering affordances.

## Capabilities

### New Capabilities
- `published-profile-provider`: Reusable provider that fetches a published profile and its sets over HTTP, wraps them in a read-only `ProfileContext`, and exposes a `PhotoResolver`. Shared by `/view` and `/p/<username>`.
- `username-registry`: Hard-coded registry module mapping kebab-case usernames to published profile base URLs, enabling `/p/<username>` routes for testing.
- `unified-set-shell`: A `SetShell` component that renders a set identically in view and edit modes, toggling edit chrome (toolbar, context menus, inline title) via a `?mode=edit` search parameter without page remount.
- `unified-profile-shell`: A `ProfileShell` component that renders the profile header and sets grid, agnostic to data source (local or published).

### Modified Capabilities
- `profile-page`: Route changes from `/profile` to `/me`. No requirement change to profile editing behavior; only the canonical route changes.
- `set-viewer`: Route changes from `/sets/[id]` to `/me/sets/[id]`. New behavior: viewer includes a floating "Edit" button when `dispatch` is available, toggling into edit mode without navigation.
- `set-editor`: Route changes from `/sets/[id]/edit` to `/me/sets/[id]?mode=edit`. No change to editing behavior; only the activation mechanism changes from a separate route to a search-param toggle.

## Impact

- All existing bookmarks to `/profile`, `/sets/[id]`, and `/sets/[id]/edit` will break (early development, acceptable).
- `ProfileContextValue` type signature changes: `dispatch` and `adapter` become optional. All consumers that read them must handle `undefined`.
- `Nav` component must be moved out of the root layout and into each route-group layout so it sees the correct provider context.
- `/view` routes move under `(published)/` route group.
- New files: `lib/registry.ts`, `lib/published-profile-provider.tsx`, `components/profile-shell.tsx`, `components/set-shell.tsx`, `app/(local)/layout.tsx`, `app/(published)/` layout/pages.
- Deleted routes: `app/sets/[id]/edit/page.tsx`, `app/profile/page.tsx`, `app/sets/page.tsx` (moved or replaced).
