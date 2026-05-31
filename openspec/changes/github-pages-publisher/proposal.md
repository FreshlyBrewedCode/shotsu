## Why

shotsu currently only supports publishing via ZIP download. Users want to publish directly to GitHub Pages so their portfolio is live on the web without manual steps. Additionally, the current architecture only supports one publisher at a time and has no configuration model for publishers. We need a configurable publisher system that supports multiple targets, starting with a GitHub Pages publisher.

## What Changes

- **New `GitHubPagesPublisher`** that pushes profile JSON, set JSONs, photos, and manifest to a GitHub repository via the Contents API, using a user-provided Personal Access Token (PAT).
- **Publisher configuration model**: `PublishTarget` gains `name` and `config` fields so each target can store its own settings (e.g., token, repo, branch).
- **Orchestrator keyed by `target.id`** instead of `publisherId`, enabling multiple targets of the same publisher type.
- **Publisher interface update**: `configure(config)` accepts a config object; publishers are stateful after configuration.
- **Publisher registry/factory**: a registry maps `publisherId` → constructor for dynamic instantiation.
- **Publisher management UI**: a popup menu on the Publish button showing configured publishers + "Configure new publisher" option.
- **Publish progress UI**: feedback during upload (progress events wired to UI).

## Capabilities

### New Capabilities
- `github-pages-publisher`: Publishing profile data to GitHub Pages via the GitHub Contents API using a PAT.
- `publisher-management`: UI and data model for configuring, listing, and selecting from multiple publisher targets.

### Modified Capabilities
- `publishing-interface`: Update `Publisher.configure()` signature to accept config; update `PublishTarget` to include `name` and `config`; update orchestrator to key by `target.id`.

## Impact

- New files: `src/lib/publisher/github-pages-publisher.ts`, `src/lib/publisher/registry.ts`, publisher configuration UI components.
- Modified files: `src/lib/publisher/types.ts`, `src/lib/publisher/orchestrator.ts`, `src/components/publish-button.tsx`.
- No new runtime dependencies (uses native `fetch` for GitHub API).
- Backward compatible: existing ZIP publisher continues to work.
