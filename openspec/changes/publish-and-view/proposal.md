## Why

With the unified viewer/editor foundation in place, we now need the first end-to-end publishing loop: transform local state into a publishable static bundle, download it as a ZIP, and view that published bundle via the same viewer components. This validates the export format, the publisher interface, and the orchestrator diffing logic before building real cloud providers.

## What Changes

- Build an **exporter** that transforms local profile state (profile, sets, referenced photos) into a provider-agnostic `FileBundle`.
- Build a **ZIP publisher** that receives a `FileBundle` and generates a downloadable ZIP archive. This is the simplest possible publisher for testing.
- Build a **publish orchestrator** that computes file diffs (SHA-256 hashes), tracks a `PublishManifest` locally in IndexedDB, and produces `PublishInstruction` objects based on publisher capability.
- Inject the manifest into the published bundle as `shotsu-manifest.json`.
- Build a **published viewer** at `/view?url=...` that fetches a published profile over HTTP and renders it using the same components as the local viewer.
- Create a `PublishedResolver` that resolves photo IDs to `${baseUrl}/photos/{id}.webp`.
- Create a `PublishedSource` that fetches `profile.json`, `sets/{id}.json`, and provides them to the existing viewer components.

## Capabilities

### New Capabilities
- `publishing-interface`: The Publisher interface, orchestrator diffing, manifest tracking, and ZIP publisher.
- `profile-exporter`: Local state → FileBundle transformation, hash computation, manifest injection.
- `published-viewer`: `/view?url=...` route, `PublishedSource`, `PublishedResolver` for viewing published profiles.

### Modified Capabilities
- `photo-resolver`: Add `PublishedResolver` as an additional resolver implementation.
- `local-profile-state`: Add `PublishManifest` and `PublishTarget` types to local storage schema for tracking published state.

## Impact

- New files: `lib/publisher/types.ts`, `lib/publisher/orchestrator.ts`, `lib/publisher/zip-publisher.ts`, `lib/exporter.ts`, `lib/published-source.ts`, `lib/published-resolver.ts`, `app/view/page.tsx`
- Modified: `lib/types.ts` (manifest types), `lib/profile-store.tsx` (publish state in IndexedDB), `lib/photo-resolver.tsx` (add PublishedResolver)
- New dependency: `jszip` (for ZIP generation)
