## Context

Currently `PhotoBlob` directly accesses `useProfile().adapter` and calls `adapter.getBlobURL("photo:{id}")` to render photos. This tightly couples all photo-rendering components to IndexedDB. There is no read-only viewer for sets — the only way to see a set is through the editor at `/sets/[id]/edit`, which includes edit affordances (toolbar, context menus) that are not appropriate for viewing.

To enable the future published-profile viewer (which will fetch JSON and photos over HTTP rather than from IndexedDB), we need a layer of indirection between photo IDs and renderable URLs.

## Goals / Non-Goals

**Goals:**
- Introduce a provider-agnostic `PhotoResolver` context so photo components no longer depend on `IndexedDBAdapter` directly.
- Create a read-only `/sets/[id]` page that renders a set using the same visual components as the editor.
- Refactor existing editor components (`PhotoBlob`, `ProfileHeader`, `SetCard`) so they work in both editing and viewing contexts.
- Ensure the set editor remains a live preview of the published output by reusing the same rendering components.

**Non-Goals:**
- Publishing, exporting, or ZIP generation.
- Published-profile viewer (`/view?url=...`).
- New storage adapters or providers.
- Adding new layout types or photo features.

## Decisions

### PhotoResolver context replaces direct adapter access
- **Rationale**: Components should not know where photo bytes come from. A `PhotoResolver` context provides `resolve(photoId: string): Promise<string>` (or sync if already cached). This enables both local IndexedDB blobs and future HTTP-based published photos to be rendered by the same components.
- **Alternative considered**: Pass `getPhotoUrl` as a prop to every photo component. Rejected because it would require threading the prop through many layers (`SetCard` → `PhotoBlob` → `img`) and is error-prone.

### LocalResolver is the default in ProfileProvider
- **Rationale**: The existing app runs entirely in local mode. The `ProfileProvider` already wraps the component tree, so it is the natural place to also provide the default `LocalResolver`.
- **Implementation**: `ProfileProvider` creates a `LocalResolver` instance (wrapping the adapter) and passes it through a new `PhotoResolver.Provider`. Child components use `usePhotoResolver()` to get the resolver function.

### SetViewer is a dedicated read-only component
- **Rationale**: A separate `SetViewer` component keeps the read-only route (`/sets/[id]`) clean and makes it obvious that no dispatch or edit context is available.
- **Implementation**: `SetViewer` accepts a `Set` object and renders its title, sections, and photos using `Section` and `PhotoBlob`. No `useProfile().dispatch` calls.

### Components gracefully handle missing dispatch
- **Rationale**: `ProfileHeader`, `SetCard`, and other shared components currently assume `dispatch` is always available. When used in viewer-only contexts (no editing), `dispatch` is absent.
- **Implementation**: Components check if dispatch is available before rendering edit affordances. For example, `ProfileHeader` only shows the "Change avatar" button and inline editing inputs when `dispatch` is present.
- **Alternative considered**: Create separate `ReadOnlyProfileHeader` and `EditableProfileHeader` components. Rejected because it duplicates rendering logic and risks drift between viewer and editor.

### SetCard links to viewer by default, editor only when editing
- **Rationale**: `SetCard` currently links directly to `/sets/${set.id}/edit`. In the sets list on `/profile`, clicking a set card should probably go to the viewer first. The editor is accessed via an explicit edit action.
- **Implementation**: `SetCard` receives an optional `editHref` prop. If provided, the card links there; otherwise it links to `/sets/${set.id}` (the viewer).

## Risks / Trade-offs

- **[Risk]** Refactoring `PhotoBlob` to use `PhotoResolver` instead of `adapter.getBlobURL()` could introduce a subtle change in lifecycle (object URL creation/revocation timing). → **Mitigation**: Keep the same `useEffect` + cleanup pattern; only change the source of the URL.
- **[Trade-off]** Adding `PhotoResolver` as a separate context means one more provider in the tree. → **Acceptable**: It stays inside `ProfileProvider` so consumers don't notice.
- **[Risk]** `SetCard` currently uses `PhotoBlob` for the cover image. After the refactor, `PhotoBlob` needs the resolver context. If `SetCard` is rendered outside `PhotoResolver.Provider`, it will crash. → **Mitigation**: Ensure `PhotoResolver.Provider` is placed above all components that might render `PhotoBlob` (which is essentially the whole app, inside `ProfileProvider`).
