## Context

shotsu has a clean publisher abstraction: `Publisher` interface, `PublishOrchestrator` for diffing/manifest tracking, and a single `ZipPublisher` implementation. The orchestrator is 1:1 with a publisher and finds prior manifests by `publisherId`. `PublishTarget` stores only `publisherId`, `isRegistered`, and `manifest`.

We need to add a `GitHubPagesPublisher` that uploads files via the GitHub Contents API. This requires:
- Per-target configuration (token, repo, branch)
- Multiple targets of the same publisher type
- Stateful publishers that hold their config after `configure()`
- A UI for selecting which target to publish to

## Goals / Non-Goals

**Goals:**
- Implement a `GitHubPagesPublisher` that pushes the `FileBundle` to a GitHub repo using the Contents API.
- Support multiple configured publishers via an updated `PublishTarget` model with `name` and `config`.
- Update the orchestrator to key by `target.id` instead of `publisherId`.
- Provide a publisher registry/factory for dynamic instantiation.
- Add minimal publisher-selection UI (popup menu on Publish button).
- Stay open to OAuth-based GitHub App auth in the future without redesign.

**Non-Goals:**
- OAuth or GitHub App authentication (PAT only for MVP).
- Static site generation (`index.html`) in the published bundle.
- S3/R2/other cloud publishers.
- Token encryption in IndexedDB.
- Advanced publisher management (rename, reorder, default target).

## Decisions

### `configure(config)` accepts a typed config object
- **Rationale**: Publishers need per-instance configuration (repo, branch, token). A stateful model where `configure()` stores config and subsequent `publish()` calls use it is simpler than passing config to every `publish()`.
- **Alternative considered**: Stateless publishers with config passed to `publish()`. Rejected because it leaks config into the orchestrator and the existing interface assumes the publisher is ready after `configure()`.

### `PublishTarget` gains `name` and `config` fields
- **Rationale**: The current model uses `publisherId` as the lookup key, preventing multiple GitHub Pages targets. Adding `name` (user label) and `config` (opaque per-publisher settings) allows N targets per publisher type.
- **Migration**: Existing targets in IndexedDB will lack `name` and `config`. On load, the UI treats them as legacy and may show a generic name; re-saving adds the new fields.

### Orchestrator keyed by `target.id`
- **Rationale**: Enables multiple targets for the same `publisherId`. The orchestrator receives `targetId` at construction and looks up the target by that ID.
- **Alternative considered**: Keep orchestrator 1:1 with publisher, but make it a multi-target coordinator. Rejected because the existing diff logic is cleanly per-target; a coordinator layer would add complexity without benefit.

### GitHub API: per-file PUT/DELETE with SHA lookup
- **Rationale**: The GitHub Contents API requires the current file's SHA for updates and deletes. The simplest approach is HEAD-per-file (GET to read SHA, then PUT/DELETE). For 50 photos this is ~100 requests, still under the 5,000/hour rate limit.
- **Alternative considered**: Use the Git Trees API for batch operations. Rejected because it's significantly more complex (requires understanding git refs, base trees, creating commits) and unnecessary for MVP.

### `GitHubPagesPublisher.getManifest()` reads from GitHub
- **Rationale**: Enables cross-client publishing recovery. The publisher fetches `shotsu-manifest.json` from the repo via the Contents API, base64-decodes it, and returns it.

### Return `url` points to `profile.json` on the Pages domain
- **Rationale**: The viewer already knows how to consume `profile.json` via `/view?url=...`. Returning the direct JSON URL makes integration trivial.

### Publisher registry is a simple `Record<string, Constructor>`
- **Rationale**: Minimal and extensible. New publishers register by adding to the map. No magic auto-discovery needed.

## Risks / Trade-offs

- **[Risk]** PAT stored in IndexedDB as plain text. → **Mitigation**: Document that the token is stored locally. Future OAuth change can replace the stored token with a refresh token or use a different auth mechanism.
- **[Risk]** GitHub Contents API returns 422 if SHA is stale (concurrent publish from another client). → **Mitigation**: Catch 422, surface as concurrent publish warning, suggest re-publishing.
- **[Risk]** `getManifest()` on GitHub requires a network request that could fail (offline, rate limited). → **Mitigation**: Falls back to full publish if manifest cannot be retrieved.
- **[Trade-off]** PAT requires `repo` scope which is broad. → **Acceptable**: MVP approach. GitHub App OAuth (future) can use granular `contents:write` permissions.
- **[Trade-off]** Each file is two API calls (GET for SHA, PUT for upload). → **Acceptable**: Simplest implementation. Optimize with tree API later if needed.

## Migration Plan

No data migration needed. IndexedDB stores `publish-targets` as an array; legacy entries without `name`/`config` will simply render with a default name and will gain the new fields when re-saved.

Rollback: revert git commit. No external state is mutated beyond what the user explicitly publishes.

## Open Questions

- Should `configure()` validate the config by making a test API call (e.g., GET `/user`)? → **Decision**: Yes, `configure()` should validate and throw if the token is invalid or the repo is inaccessible.
