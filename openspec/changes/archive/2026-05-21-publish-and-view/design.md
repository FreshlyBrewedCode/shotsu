## Context

With the `PhotoResolver` context and shared viewer components in place (Change 1), we need the first end-to-end publishing loop. The goal is to prove the architecture: local profile → exported bundle → ZIP download → serve via HTTP → view with the same components.

This change introduces three new subsystems: the exporter (local state → files), the publishing interface (orchestrator + ZIP publisher), and the published viewer (HTTP fetch → shared components).

## Goals / Non-Goals

**Goals:**
- Transform local profile state into a provider-agnostic `FileBundle` containing JSON + photos + manifest.
- Implement a publish orchestrator that computes file diffs using SHA-256 hashes, tracks `PublishManifest` locally in IndexedDB, and produces capability-driven `PublishInstruction` objects.
- Implement a ZIP publisher that receives a `FileBundle` and generates a downloadable ZIP archive.
- Inject the manifest into the published bundle as `shotsu-manifest.json` so remote state can be recovered.
- Implement a published viewer at `/view?url=...` that fetches a published profile over HTTP and renders it using the same components as the local viewer.
- Support cross-client publishing by recovering the remote manifest via an optional `getManifest()` publisher method.

**Non-Goals:**
- Real cloud providers (S3, R2, GitHub Pages) — these come in a future change.
- Cloud backend for username registration or `/u/[username]` routes.
- In-place editing of published profiles.
- Thumbnail generation or image optimization for published bundles.

## Decisions

### Orchestrator owns diffing, publishers are stateless
- **Rationale**: Keeping diff logic in the orchestrator means new publisher implementations only need to handle "upload these files" or "delete these files." They don't need to track remote state.
- **Alternative considered**: Let each publisher implement its own diffing. Rejected because it duplicates logic and makes incremental publishers harder to write.

### Manifest is published alongside content
- **Rationale**: Enables state recovery when publishing from a different client or after local data loss. The manifest is just another file in the bundle (`shotsu-manifest.json`).
- **Recovery flow**: When a client has no local manifest for a target, it calls `publisher.getManifest()` to read the remote `shotsu-manifest.json`. If that fails, it falls back to a full publish.

### Capability-driven instruction shapes
- **Rationale**: Publishers have fundamentally different constraints. A ZIP publisher can only do full rewrites. An S3 publisher can do incremental updates. The orchestrator checks `capabilities.incremental` and produces the appropriate instruction shape.
- **Instruction shapes**:
  - `{ mode: 'full', files: [...] }` for non-incremental publishers
  - `{ mode: 'incremental', puts: [...], deletes: [...] }` for incremental publishers

### Generation counter for concurrent publish detection
- **Rationale**: Two clients publishing the same target simultaneously can produce inconsistent remote state. A monotonic `generation` counter in the manifest lets the orchestrator detect this and warn the user.
- **Behavior**: If `remoteManifest.generation > localExpectedGeneration`, the orchestrator warns: "Another device published more recently." The user can proceed (last-write-wins) or cancel.

### PublishedResolver is a separate resolver implementation
- **Rationale**: Published photos are served as static files (`./photos/{id}.webp`), not IndexedDB blobs. `PublishedResolver` takes a `baseUrl` and resolves `photoId → ${baseUrl}/photos/${photoId}.webp`.
- **Usage**: The `/view?url=...` page wraps the viewer in a `PhotoResolver.Provider` with `PublishedResolver`.

### PublishedSource fetches JSON from HTTP, not IndexedDB
- **Rationale**: A published profile lives on a static host as `profile.json` + `sets/{id}.json` files. The viewer needs a data source that fetches these over HTTP instead of reading from IndexedDB.
- **Implementation**: `PublishedSource` fetches `profile.json`, then each `sets/{id}.json` referenced by the profile. It exposes a minimal interface compatible with the viewer components.

### Exporter includes only referenced photos
- **Rationale**: The local catalog may contain photos not used in any set. Including them bloats the published bundle. The exporter scans all sets + the avatar to determine which photo blobs to include.
- **Trade-off**: Orphan photos (in catalog but not in any set) are lost from the published bundle. This is acceptable — the catalog is an editing concern.

### Published JSON is the same shape as local JSON
- **Rationale**: The viewer components expect `Profile` and `Set` objects in a specific shape. Changing the published format would require the viewer to handle two shapes. Instead, the published JSON is byte-identical to the local JSON (photo IDs stay as IDs).
- **Future**: If we need to inject EXIF into published sets, the exporter can mutate the JSON before writing it.

## Risks / Trade-offs

- **[Risk]** SHA-256 hashing every photo blob during export could be slow for large galleries. → **Mitigation**: Hashing runs in the main thread for the MVP. For >100 photos, consider moving to a web worker in a future optimization.
- **[Risk]** If the manifest save to IndexedDB fails after a successful publish, the next publish will re-upload everything. → **Mitigation**: Non-incremental publishers (ZIP) don't care. For future incremental publishers, this is a minor inefficiency, not data loss.
- **[Risk]** The published viewer (`/view?url=...`) fetches arbitrary URLs, which is a potential XSS/CSRF vector if the URL is attacker-controlled. → **Mitigation**: The viewer only renders JSON + images, never executes scripts from the fetched source. We still validate that fetched content parses as expected `Profile` / `Set` shapes.
- **[Trade-off]** `jszip` is a new dependency (~100KB). It's only needed for the ZIP publisher. → **Acceptable**: It's the simplest way to generate ZIPs in the browser. Could be replaced with a lighter library later.
- **[Trade-off]** The ZIP publisher is non-incremental and always produces a full bundle. For large galleries this means re-downloading all photos every time. → **Acceptable**: ZIP is a testing / backup mechanism, not the primary publishing workflow. Incremental providers will be built later.

## Open Questions

- Should the exporter inject EXIF metadata directly into published set JSONs so the viewer can display camera/lens info without a catalog? (Deferred — can be added later without changing the architecture.)
- Should the ZIP publisher include an `index.html` for standalone viewing, or is the shotsu app viewer sufficient? (Decision: app viewer is sufficient for now.)
