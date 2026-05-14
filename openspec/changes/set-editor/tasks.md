## Batch 1: Foundation

Types, storage adapter, and profile state initialization.

- [x] 1.1 Create `lib/types.ts` defining `Profile`, `SetSummary`, `Set`, `Section`, `PhotoRef` (`{ id: string }`), `CatalogEntry`, and `ExifData` TypeScript interfaces
- [x] 1.2 Add helper to generate a new default `Section` (UUID id, layout `"default"`, empty photos array)
- [x] 1.3 Add helper to generate a new default `Set` (UUID id, empty title, one default section)
- [x] 2.1 Create `lib/storage/adapter.ts` defining the `StorageAdapter` interface (`initialize`, `getDoc`, `setDoc`, `deleteDoc`, `putBlob`, `getBlobURL`, `deleteBlob`)
- [x] 2.2 Install the `idb` library (`npm install idb`)
- [x] 2.3 Create `lib/storage/indexeddb-adapter.ts` implementing `StorageAdapter` using IndexedDB with two object stores: `documents` (string keys → JSON) and `blobs` (string keys → Blob)
- [x] 2.4 In `IndexedDBAdapter.initialize()`, call `navigator.storage.persist()` and log a warning if denied
- [x] 2.5 Verify `getDoc` returns `null` for missing keys without throwing
- [x] 2.6 Verify `getBlobURL` returns a `URL.createObjectURL(...)` string for stored blobs
- [x] 4.1 Create `lib/profile-store.tsx` with `ProfileContext`, `ProfileProvider`, and `useProfile` hook
- [x] 4.2 `ProfileProvider` accepts a `StorageAdapter` prop and calls `adapter.initialize()` on mount before loading state
- [x] 4.3 On mount, load profile from `adapter.getDoc("profile")` and catalog index from `adapter.getDoc("catalog-index")` — initialize defaults if null
- [x] 4.6 Wrap the root layout (`app/layout.tsx`) with `ProfileProvider`, passing an `IndexedDBAdapter` instance
- [x] 9.1 Verify the storage layer: the app boots without console errors, IndexedDB stores are created, and adapter document/blob round-trips persist across a page reload

## Batch 2: Nav & Empty Set

Create and edit an empty set with a title.

- [x] 4.4a Implement `useReducer` profile-level actions: `CREATE_SET`, `UPDATE_SET_TITLE`
- [x] 4.5 Each mutation action SHALL persist the affected document to the adapter (`setDoc`) before resolving
- [x] 5.1 Create a `Nav` component (`components/nav.tsx`) with a "plus" icon button for creating a new set
- [x] 5.2 Wire the plus button to dispatch `CREATE_SET`, then `router.push` to `/sets/[new-id]/edit`
- [x] 5.3 Add the `Nav` component to the root layout so it appears on all pages
- [x] 6.1 Create the page at `app/sets/[id]/edit/page.tsx`
- [x] 6.2 Read the set from profile context by `id`; redirect to `/` if not found
- [x] 6.3 Render an editable inline title input at the top, wired to `UPDATE_SET_TITLE`
- [x] 9.2 Verify set persistence: click "+" to create a set, edit the title, reload the page — the set and title are present

## Batch 3: Section Management

Add, remove, reorder, and layout sections.

- [x] 4.4b Implement `useReducer` section-level actions: `ADD_SECTION`, `REMOVE_SECTION`, `MOVE_SECTION`, `UPDATE_SECTION_LAYOUT`
- [x] 6.4 Render all sections in order using the existing `Section` component
- [x] 6.6 Add a thin visual separator or label between sections in edit mode
- [x] 6.7 Wrap each Section with edit-mode interaction affordances (hover border, context menu trigger)
- [x] 9.3 Verify section persistence: add, remove, reorder, and change layout of sections, then reload and confirm state is restored
- [x] 9.4 Verify "Remove Section" is blocked when only one section remains
- [x] 9.5 Verify "Move Section Up/Down" boundary conditions are no-ops

## Batch 4: Photo Ingest & Rendering

Ingest photos and render them in sections.

- [x] 3.1 Install the `exifr` library (`npm install exifr`)
- [x] 3.2 Create `lib/ingest.ts` implementing the ingest pipeline: accepts `File` + target `{ setId, sectionId }` + adapter instance
- [x] 3.3 Implement EXIF extraction step using `exifr.parse()` — handle failure gracefully with empty `ExifData`
- [x] 3.4 Implement resize step: use `createImageBitmap()` + `OffscreenCanvas` to resize to max 2400px long edge, output as `image/webp` — do not upscale images already within limit
- [x] 3.5 Store resized blob via `adapter.putBlob("photo:{id}", blob)`
- [x] 3.6 Append new `CatalogEntry` to catalog index via `adapter.setDoc("catalog-index", updatedIndex)`
- [x] 3.7 Return the new photo `id` for the caller to dispatch `ADD_PHOTO`
- [x] 4.4c Implement `useReducer` photo-level actions: `ADD_PHOTO`, `REMOVE_PHOTO`
- [x] 6.5 Resolve each `PhotoRef.id` to a blob URL via `adapter.getBlobURL("photo:{id}")` for rendering; revoke object URLs on cleanup
- [x] 6.8 Add a file input (hidden, `accept="image/*"`, `multiple`) triggered by the "Add Photo" action; run ingest pipeline on selected files and dispatch `ADD_PHOTO`
- [x] 9.6 Verify ingest pipeline: select an image, confirm blob stored, catalog index updated, photo renders in editor
- [x] 9.7 Verify EXIF extraction: select a photo with EXIF, confirm metadata in catalog index
- [x] 9.8 Verify resize: select an image >2400px, confirm output dimensions are capped
- [x] 9.9 Verify object URL cleanup: confirm no memory leak warnings on section/photo unmount

## Batch 5: Edit UX & Polish

Toolbar, context menus, responsive behavior, and final verification.

- [x] 7.1 Create `components/edit-toolbar.tsx` with fixed positioning (left sidebar on `md+`, bottom bar on mobile)
- [x] 7.2 Add an "Add Section" icon button that dispatches `ADD_SECTION` for the current set
- [x] 7.3 Ensure all toolbar buttons have `aria-label` and a tooltip
- [x] 7.4 Render the toolbar only on `/sets/[id]/edit` routes
- [x] 8.1 Create `components/edit-context-menu.tsx` — accepts element type (`"section"` | `"photo"`) and the relevant ids, renders appropriate actions
- [x] 8.2 Implement bottom-sheet presentation for mobile viewports (slide-up drawer)
- [x] 8.3 Implement popover presentation for desktop viewports, positioned near the trigger element
- [x] 8.4 Implement right-click (`contextmenu` event) trigger handler for sections and photos in the editor
- [x] 8.5 Implement long-press (500ms `touchstart`/`touchend`) trigger handler for mobile
- [x] 8.6 Wire "Remove Section" → dispatch `REMOVE_SECTION` (no-op if last section)
- [x] 8.7 Wire "Move Section Up" / "Move Section Down" → dispatch `MOVE_SECTION`
- [x] 8.8 Wire "Change Layout" → show layout options (`default`, `columns`) → dispatch `UPDATE_SECTION_LAYOUT`
- [x] 8.9 Wire "Add Photo" → trigger the hidden file input → run ingest pipeline
- [x] 8.10 Wire "Remove Photo" → dispatch `REMOVE_PHOTO` (removes from section only; blob stays in catalog)
- [x] 8.11 Implement dismiss on outside click, Escape key, and after action selection
- [x] 9.10 Verify the editor renders correctly on mobile viewport sizes
- [x] 9.11 Verify context menu appears as bottom sheet on mobile and popover on desktop
- [x] 9.12 Run `npm run build` and resolve any TypeScript or lint errors
