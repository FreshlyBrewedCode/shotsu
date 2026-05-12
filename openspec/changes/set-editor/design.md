## Context

Shotsu is a local-first photography portfolio web app built with Next.js. The current codebase has static `Section` and `Photo` rendering components but no data model, state management, or editing UI. This change introduces the foundational local state layer, photo catalog, and the set editor UI that will form the core of the app's editing experience.

The app targets both desktop and mobile. The editing UX described in the README calls for a left-side toolbar on desktop and a bottom toolbar on mobile, plus context menus via right-click (desktop) or long-press (mobile).

## Goals / Non-Goals

**Goals:**
- Define and implement the core data model: Profile, Set, Section, PhotoRef, CatalogEntry
- Implement a generic storage adapter interface with an IndexedDB implementation
- Implement local-first state management (React context + useReducer) backed by the storage adapter
- Maintain a photo catalog metadata index for future catalog browsing
- Implement a photo ingest pipeline: file selection → EXIF extraction → resize → store blob + update index
- Build the set editor page that renders a live preview of the set while in edit mode
- Implement the edit toolbar (persistent, context-aware)
- Implement the per-element context menu (right-click / long-press)
- Allow creating a new set via the nav plus button
- Allow editing set title, adding/removing/reordering sections, changing section layout, and adding/removing photos from local files

**Non-Goals:**
- Publishing or export to any provider
- File System Access API (desktop-only, deferred to a future adapter)
- Multi-profile support
- Authentication or remote sync
- Drag-and-drop reordering (manual up/down buttons are sufficient for v1)
- Undo/redo history
- Photo deduplication at ingest time
- Catalog browser UI (picking from existing photos — ingest only for v1)

## Decisions

### D1: State management — React Context + useReducer + StorageAdapter

**Decision**: Use a single React context with `useReducer` for in-memory profile and set state. All persistence (JSON documents and photo blobs) goes through a `StorageAdapter` interface. The adapter is called explicitly on mutations, not via `useEffect` sync.

**Rationale**: Separating the in-memory state (fast, synchronous, React-friendly) from persistence (async, adapter-mediated) keeps the reducer pure and makes the storage layer swappable. A `useEffect` sync to localStorage is too simplistic once photos are involved — blobs require async writes.

**Alternatives considered**:
- localStorage sync via useEffect: breaks down for binary data; 5MB limit too small for photo blobs.
- Zustand: Adds a dependency; the adapter pattern achieves swappability without it.
- Server actions + DB: Contradicts the local-first principle.

### D2: Storage — generic adapter interface + IndexedDB implementation

**Decision**: Define a generic `StorageAdapter` interface with two buckets — documents (JSON-serializable objects, keyed by string) and blobs (binary, keyed by string). v1 implementation uses IndexedDB via the `idb` library. Future implementations (File System Access API, OPFS) slot in without changing callers.

**Interface:**
```ts
interface StorageAdapter {
  initialize(): Promise<void>
  // Documents
  getDoc<T>(key: string): Promise<T | null>
  setDoc<T>(key: string, value: T): Promise<void>
  deleteDoc(key: string): Promise<void>
  // Blobs
  putBlob(key: string, blob: Blob): Promise<void>
  getBlobURL(key: string): Promise<string>   // returns object URL
  deleteBlob(key: string): Promise<void>
}
```

**Key scheme:**
- `"profile"` → Profile document (singleton)
- `"set:{id}"` → Set document
- `"catalog-index"` → CatalogEntry[] document
- `"photo:{id}"` → photo blob

**Rationale**: The adapter is domain-agnostic — it knows nothing about Profile or Set. Domain knowledge lives in a thin `ProfileStore` layer that calls the adapter with the correct keys. This keeps the adapter stable as the domain evolves, and makes the IndexedDB → FSA migration a matter of swapping one implementation.

**Alternatives considered**:
- Domain-specific adapter (getProfile, saveSet, etc.): Couples the adapter to the domain model; any data model change requires adapter changes.
- OPFS for blobs: Better I/O performance but adds implementation complexity. Can be a future adapter.

### D3: Data model — photo refs store id only, not src URL

**Decision**: `PhotoRef = { id: string }`. Sets reference photos by catalog id. The `src` URL for rendering is produced at runtime by calling `adapter.getBlobURL(id)`, which returns a `URL.createObjectURL(...)` string valid for the session.

The published format (relative URLs baked into set JSON) is a separate concern — the publisher translates ids to relative URLs at publish time. The local model never stores src URLs.

**Rationale**: Storing a blob URL in the model is meaningless — object URLs are session-scoped and non-portable. The id is the stable identity. This also enables sharing: multiple sets can reference the same photo id; the blob is stored once in the catalog.

**CatalogEntry (metadata index):**
```ts
type CatalogEntry = {
  id: string           // UUID, also the blob store key
  filename: string     // original filename
  mimeType: string     // "image/webp" after resize
  width: number        // post-resize dimensions
  height: number
  exif: ExifData       // extracted at ingest
  addedAt: string      // ISO timestamp
}

type ExifData = {
  dateTaken?: string
  camera?: string
  lens?: string
  focalLength?: number
  aperture?: number
  shutterSpeed?: string
  iso?: number
  gps?: { lat: number, lng: number }
}
```

The catalog index (`"catalog-index"` doc) is a `CatalogEntry[]` maintained at ingest time. It enables future catalog browsing without loading blobs.

**Rationale**: Keeping a lightweight index separate from the blobs means a future catalog browser UI can render a photo grid from the index alone, fetching blobs lazily as thumbnails scroll into view.

### D4: Photo ingest pipeline

**Decision**: When a user selects files to add to a set, the app runs each file through an ingest pipeline before storing:

1. Read as `File` object from `<input type="file" accept="image/*" multiple>`
2. Extract EXIF using `exifr` library (reads from File, runs in-browser)
3. Resize if needed: max 2400px on the long edge, using `OffscreenCanvas` + `createImageBitmap()`, output as WebP
4. Store resized blob via `adapter.putBlob("photo:{id}", blob)`
5. Append `CatalogEntry` to catalog index via `adapter.setDoc("catalog-index", updatedIndex)`
6. Dispatch `ADD_PHOTO` with the new photo id into the set's section

**Rationale**: EXIF extraction and resizing happen once at ingest. Downstream consumers (editor, viewer, publisher) never need to re-process the original. WebP is chosen for its compression efficiency. 2400px covers high-density displays without storing unnecessarily large files.

**Alternatives considered**:
- Storing originals and resizing on demand: Higher storage cost, more complex rendering pipeline.
- Web Worker for ingest: Better UX (non-blocking) but adds complexity; can be added later if ingest is noticeably slow.

### D5: Set editor routing — `/sets/[id]/edit`

**Decision**: The set editor lives at `/sets/[id]/edit`. The set viewer (read-only) will live at `/sets/[id]`. The editor reuses the same rendering components as the viewer but wraps them with edit-mode overlays.

**Rationale**: Clean URL separation between view and edit. The editor can share rendering logic with the viewer, keeping visual fidelity between edit and published views.

### D6: Edit toolbar — fixed sidebar (desktop) / bottom bar (mobile)

**Decision**: A single `EditToolbar` component that uses CSS/Tailwind responsive classes to render as a fixed left sidebar on `md+` screens and a fixed bottom bar on smaller screens.

**Rationale**: Follows the README UX spec directly. Keeping it as one component avoids duplicated logic. Tailwind's responsive prefixes make this straightforward.

### D7: Context menu — Radix UI Popover (desktop) + bottom sheet (mobile)

**Decision**: Use a custom bottom-sheet/drawer component for mobile context menus and a popover-style menu for desktop. Trigger: `contextmenu` event on desktop, `touchstart`/`touchend` long-press detection on mobile.

**Rationale**: shadcn/ui is already present (components.json). Radix primitives are available. A bottom drawer matches the README spec for mobile.

## Risks / Trade-offs

- **Object URL memory leaks** → `getBlobURL` returns `URL.createObjectURL(...)` which must be revoked when no longer needed. Mitigation: revoke in component cleanup (`useEffect` return). For large sets, consider lazy loading via Intersection Observer.
- **IndexedDB storage eviction** → Browsers can evict IndexedDB under storage pressure without warning. Mitigation: call `navigator.storage.persist()` at startup to request persistent storage; warn user if denied.
- **Ingest blocking the main thread** → EXIF extraction and canvas resize are synchronous on the main thread for large files. Mitigation: acceptable for v1; move to a Web Worker if benchmarking shows >200ms blocking.
- **No undo/redo** → Users can accidentally delete sections or photos. Mitigation: confirmation dialogs for destructive actions.
- **UUID collision** → Using `crypto.randomUUID()` — negligible probability for volumes involved.

## Open Questions

- Should new sets be initialized with one empty section, or truly blank? (Recommendation: one empty section for better onboarding.)
- Should the editor auto-save on every mutation, or require an explicit save action? (Recommendation: auto-save — adapter writes on every mutation, consistent with local-first.)
- Max resize dimension: 2400px is the working assumption. Should this be user-configurable in v1 or hardcoded?
