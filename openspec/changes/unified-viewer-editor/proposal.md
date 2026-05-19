## Why

The app currently has no read-only viewer for sets — the only way to see a set is through the editor (`/sets/[id]/edit`). More importantly, `PhotoBlob` directly couples to `IndexedDBAdapter`, making it impossible to render photos from any other source (e.g., a published profile fetched over HTTP). To enable the future publishing and viewing pipeline, we need a provider-agnostic photo resolution layer and a shared set of viewer components that work for both local and published data.

## What Changes

- Introduce a `PhotoResolver` React context that maps `photoId → URL`. `LocalResolver` wraps `IndexedDBAdapter.getBlobURL()`. Photo components consume the resolver instead of the adapter directly.
- Create a read-only `/sets/[id]` viewer page that renders a set using the same components as the editor (sections, layouts, photos) but without edit affordances.
- Refactor existing components (`PhotoBlob`, `ProfileHeader`, `SetCard`) to work when `dispatch` is absent, so they can be reused in viewer-only contexts.
- The set editor (`/sets/[id]/edit`) continues to use the same rendering components with edit overlays (toolbar, context menu) added on top.

## Capabilities

### New Capabilities
- `photo-resolver`: Provider-agnostic photo resolution context with `LocalResolver` implementation.
- `set-viewer`: Read-only set viewer page at `/sets/[id]` using shared rendering components.

### Modified Capabilities
- `local-profile-state`: The `PhotoRef` rendering requirement changes from `adapter.getBlobURL("photo:{id}")` to resolution via the `PhotoResolver` context. The IndexedDB adapter is no longer accessed directly by UI components.
- `set-editor`: The editor MUST reuse the same rendering components as the set viewer to guarantee live preview accuracy.

## Impact

- New files: `lib/photo-resolver.tsx`, `app/sets/[id]/page.tsx`, `components/set-viewer.tsx`
- Modified: `components/photo-blob.tsx`, `components/profile-header.tsx`, `components/set-card.tsx`, `app/profile/page.tsx`, `app/sets/[id]/edit/page.tsx`
- No new dependencies.
