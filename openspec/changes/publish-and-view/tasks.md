## 1. Dependencies & Types

- [ ] 1.1 Add `jszip` to `package.json` dependencies
- [ ] 1.2 Create `lib/publisher/types.ts` with `Publisher`, `PublisherCapabilities`, `PublishInstruction`, `PublishResult`, `PublishManifest`, `FileBundle`, `PublishFile`, `ProgressEvent`, and `PublishOptions` interfaces
- [ ] 1.3 Extend `lib/types.ts` with `PublishTarget` type (including `isRegistered` flag)

## 2. Profile Exporter

- [ ] 2.1 Create `lib/exporter.ts` with `exportProfile()` function
- [ ] 2.2 Implement referenced photo collection: scan all sets + avatar to find which photo blobs to include
- [ ] 2.3 Implement SHA-256 hash computation for each file using `crypto.subtle.digest`
- [ ] 2.4 Generate `PublishManifest` with `generation` counter (start at 1 for first export)
- [ ] 2.5 Inject `shotsu-manifest.json` into the `FileBundle`
- [ ] 2.6 Add unit tests for exporter (verify file list, verify hash computation)

## 3. Publish Orchestrator

- [ ] 3.1 Create `lib/publisher/orchestrator.ts` with `PublishOrchestrator` class
- [ ] 3.2 Implement manifest load from IndexedDB (`publish-targets` document)
- [ ] 3.3 Implement diff computation: compare current bundle hashes against manifest hashes
- [ ] 3.4 Implement capability-driven instruction generation (`full` vs `incremental`)
- [ ] 3.5 Implement `getManifest()` fallback: call `publisher.getManifest()` when local manifest is missing
- [ ] 3.6 Implement concurrent publish detection: compare remote generation vs local expected
- [ ] 3.7 Implement manifest save to IndexedDB on successful publish
- [ ] 3.8 Wire `onProgress` callback through orchestrator to publisher

## 4. ZIP Publisher

- [ ] 4.1 Create `lib/publisher/zip-publisher.ts` implementing `Publisher`
- [ ] 4.2 Implement `configure()` (no-op for ZIP)
- [ ] 4.3 Implement `publish()` for `{ mode: 'full', files }`: generate ZIP via `jszip`, trigger browser download
- [ ] 4.4 Return dummy `url: 'file://local-download'` in `PublishResult`
- [ ] 4.5 Add unit test: verify ZIP contains expected files

## 5. Published Viewer

- [ ] 5.1 Create `lib/published-resolver.ts` with `PublishedResolver` class
- [ ] 5.2 Create `lib/published-source.ts` with `PublishedSource` that fetches `profile.json` and `sets/{id}.json`
- [ ] 5.3 Create `app/view/page.tsx` route that reads `url` query parameter
- [ ] 5.4 Wrap fetched data in `PhotoResolver.Provider` with `PublishedResolver`
- [ ] 5.5 Render profile using `ProfileHeader` and `SetCard` components (read-only mode)
- [ ] 5.6 Handle errors: missing URL, network failure, invalid JSON
- [ ] 5.7 Add e2e test: serve a published bundle locally, navigate to `/view?url=...`, verify rendering

## 6. Integration & UI

- [ ] 6.1 Add a "Publish" button to `/profile` page that triggers the export + publish flow
- [ ] 6.2 Show publish progress/status in the UI
- [ ] 6.3 Store publish target config in IndexedDB after first configuration
- [ ] 6.4 Add a "View Published" link next to the publish button (opens `/view?url=...`)

## 7. Testing & Verification

- [ ] 7.1 End-to-end test: create profile → add set → add photo → publish ZIP → extract → serve → view via `/view?url=...`
- [ ] 7.2 Unit tests for orchestrator diff logic
- [ ] 7.3 Verify existing tests still pass (`npm run test:unit`, `npm run test:e2e`)
- [ ] 7.4 Run linter (`npm run lint`)
