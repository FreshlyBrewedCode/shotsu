## Context

The application currently has two disconnected viewing worlds:

1. **Local editing world** (`/profile`, `/sets/[id]`, `/sets/[id]/edit`): Uses `ProfileProvider` (IndexedDB-backed reducer) inside `ProfileProviderWrapper`. All components assume `dispatch` and `adapter` exist.
2. **Published viewing world** (`/view?url=...`, `/view/sets/[id]?url=...`): Each page manually fetches profile.json, fabricates a fake `ProfileContext` with `dispatch` and `adapter` cast as `undefined`, and wraps a `PhotoResolver.Provider`.

The `Nav` component is hard-coded into the root layout inside `ProfileProviderWrapper`, so it always assumes local mode. Published viewer pages still render this local-nav (with create-set button) even though the body shows someone else's published profile.

Set view-to-edit transitions navigate from `/sets/[id]` to `/sets/[id]/edit` — a separate route in Next.js App Router. Even though it's client-side navigation, the page component remounts, `useEffect(() => window.scrollTo(0, 0), [])` re-fires, and the scroll position is lost.

There is no path toward `/p/<username>` routes for a registry-based published viewer.

## Goals / Non-Goals

**Goals:**
- Unify rendering so `ProfileHeader`, `SetViewer`, `SetCard`, and `PhotoBlob` work identically for local, published, and editing contexts.
- Eliminate page remount when toggling between set view and edit modes.
- Rename local routes to `/me/*` to make room for `/p/<username>` published routes.
- Introduce `PublishedProfileProvider` so published viewing is a first-class provider, not inline page logic.
- Add a hard-coded username registry for testing `/p/<username>` before a real backend exists.
- Keep `/view?url=...` as a direct-link fallback, rendered through the same unified shell.
- Make `Nav` context-aware (hides create-set button in published mode).

**Non-Goals:**
- Adding a real backend registry (the registry is hard-coded for experimentation).
- Changing photo-resolver or storage adapter contracts (only the provider wiring changes).
- Adding new photo/layout features.
- Changing the publish ZIP flow or exporter logic.
- Creating a "preview" read-only mode for the local `/me` profile page (it stays edit-first).

## Decisions

### Route groups with separate layouts
- **Rationale**: The root layout (`app/layout.tsx`) should contain only HTML shell, fonts, and global CSS. Provider trees belong in route-group layouts so each subtree gets the correct context without conditional provider swapping at the root.
- **Alternative considered**: Keep one root layout and sniff the pathname to decide which provider to render. Rejected because it couples routing awareness into the layout and makes the published-viewer provider tree share a layout with local editing (which causes the nav problem today).
- **Implementation**: `(local)/layout.tsx` wraps `ProfileProvider` + `Nav`. `(published)/view/page.tsx` wraps `PublishedProfileProvider` + `Nav`. `/p/[username]/layout.tsx` (server component) validates username and wraps `PublishedProfileProvider` + `Nav`.

### `ProfileContextValue.dispatch` and `adapter` become optional
- **Rationale**: `ProfileHeader` already infers edit mode by checking `dispatch !== undefined`. Making it official in the type means the published viewer no longer needs `undefined as unknown as ...` casts.
- **Alternative considered**: Create a separate `PublishedProfileContext` with only `{ state }`. Rejected because it would force `ProfileHeader`, `SetCard`, etc. to consume two different contexts, duplicating logic.
- **Implementation**: `dispatch?:` and `adapter?:` in `ProfileContextValue`. `useProfile()` still asserts presence for local consumers; a future `useLocalProfile()` helper could assert both are present.

### Set edit mode via `?mode=edit` search param
- **Rationale**: In Next.js App Router, changing search params on the same route (`/me/sets/[id]` → `/me/sets/[id]?mode=edit`) re-renders the page component in place without remounting. `useEffect(() => window.scrollTo(0,0), [])` does not re-fire. History gets a stack entry so Back works naturally.
- **Alternative considered**: Use a client-side state variable (e.g., `const [isEditing, setIsEditing] = useState(false)`). Rejected because it wouldn't update the URL, so Back/Forward wouldn't work, and refreshing the page would lose edit mode.
- **Implementation**: `const isEditing = searchParams.get("mode") === "edit"`. `SetShell` receives `isEditing` as a prop and conditionally renders `EditToolbar`, `EditContextMenuOverlay`, and inline title input.

### `EditProvider` always present in local set pages
- **Rationale**: `SetShell` needs to safely render edit chrome when `isEditing` is true. Wrapping the page in `EditProvider` unconditionally means `SetShell` doesn't need conditional provider wrapping, keeping the page component clean.
- **Alternative considered**: Only wrap with `EditProvider` when `isEditing` is true. Rejected because it would require dynamic provider wrapping inside the page component, which is awkward in React.
- **Implementation**: `app/me/sets/[id]/page.tsx` always wraps children in `<EditProvider setId={id}>`. `SetShell` only renders edit chrome when `isEditing && dispatch`.

### Hard-coded registry in `lib/registry.ts`
- **Rationale**: A real backend registry is out of scope. We need to test the `/p/<username>` routing and `PublishedProfileProvider` integration now so the architecture is ready.
- **Alternative considered**: Skip the registry and only use `/view?url=...`. Rejected because it doesn't validate the `/p/<username>` layout/provider pattern.
- **Implementation**: Simple `Record<string, string>` map. `resolveUsername(username)` returns the base URL or `null`. `/p/[username]/layout.tsx` (server component) calls `resolveUsername` and calls `notFound()` if unknown.

### `SetShell` and `ProfileShell` as shared orchestrator components
- **Rationale**: Both local and published routes need the same layout (header + content sections for profile; viewer + optional edit chrome for set). Extracting these into shared components eliminates duplication between `/me`, `/view`, and `/p/:user` pages.
- **Alternative considered**: Keep page components as the orchestrators and share only `SetViewer`/`ProfileHeader`. Rejected because the profile page has significant layout logic (preview sets, "Show all", PublishButton, Create Set button) that would otherwise be duplicated.
- **Implementation**: `ProfileShell` receives a `makeSetHref` prop so it can generate relative links (`/me/sets/:id` for local, `/p/:user/sets/:id` for published). `SetShell` receives `setId` and `isEditing` and reads from `ProfileContext`.

### `/sets` page stays at `/sets`
- **Rationale**: The user explicitly wants to keep `/sets` as the full sets list. It doesn't need to move under `/me/sets` because it's a standalone page that works in both contexts (though in practice it's only linked from local profile).
- **Alternative considered**: Move it to `/me/sets`. Rejected per user preference.

## Risks / Trade-offs

- **[Risk]** Making `dispatch` optional means any component that forgets to check it could crash at runtime when used in published mode. → **Mitigation**: `ProfileHeader` already does this correctly. We audit all consumers (`PublishButton` needs `adapter` — it asserts or only renders locally). TypeScript will flag direct property access on the optional fields.
- **[Risk]** `Nav` currently calls `useProfile().dispatch` unconditionally. In published mode, `dispatch` is undefined, so `Nav` would throw if not updated. → **Mitigation**: Update `Nav` to check `dispatch` before rendering the create-set button. This is part of the change.
- **[Risk]** Old bookmarks and share links to `/profile`, `/sets/[id]/edit`, `/sets/[id]` will break. → **Mitigation**: Early development phase, acceptable. No redirects added (out of scope).
- **[Trade-off]** Route groups add one extra layer of directory nesting. → **Acceptable**: The clarity of separate local vs published provider trees outweighs the directory complexity.
- **[Trade-off]** `/p/[username]/layout.tsx` is a server component that fetches from a hard-coded map. When we replace it with a real backend, the layout signature changes (may need `async` or data fetching). → **Acceptable**: The `PublishedProfileProvider` component is client-side and its props don't change. Only the layout's data source changes.
- **[Risk]** `PhotoBlob` calls `URL.revokeObjectURL()` on all URLs in cleanup, including HTTP URLs from `PublishedResolver`. Currently a browser no-op, but semantically wrong. → **Mitigation**: No change in this proposal. Will revisit if a caching layer is added later.

## Migration Plan

This is an in-place refactor with no data migration (IndexedDB data is unaffected). The migration is purely route and code reorganization:

1. Optionalize `dispatch` and `adapter` in `ProfileContextValue`.
2. Extract `PublishedProfileProvider` from inline `/view/page.tsx` logic.
3. Build `ProfileShell` and `SetShell` components.
4. Rename routes (`/profile` → `/me`, `/sets/[id]` → `/me/sets/[id]`, `/sets/[id]/edit` → merge into `/me/sets/[id]?mode=edit`).
5. Move providers into route-group layouts.
6. Update `Nav` for context awareness.
7. Add `lib/registry.ts` and `/p/[username]` routes.
8. Verify `/view?url=...` still works via `PublishedProfileProvider`.
9. Run e2e tests (they will need route updates).

No rollback strategy needed — if broken, revert the git commit.

## Open Questions

- None remaining. All decisions (route names, shell architecture, registry approach, optional dispatch, edit param) are locked.
