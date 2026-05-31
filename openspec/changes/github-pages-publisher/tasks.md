## 1. Core Publisher Infrastructure

- [x] 1.1 Update `Publisher` interface: `configure(config: Record<string, unknown>): Promise<void>`
- [x] 1.2 Update `PublishTarget` type to include `name` and `config` fields
- [x] 1.3 Update `PublishOrchestrator` to accept `targetId` and key by target ID
- [x] 1.4 Update `ZipPublisher.configure()` to accept and ignore config (no-op)
- [x] 1.5 Create `src/lib/publisher/registry.ts` with factory function `createPublisher(publisherId, config)`

## 2. GitHub Pages Publisher

- [x] 2.1 Create `src/lib/publisher/github-pages-publisher.ts` with `GitHubPagesPublisher` class
- [x] 2.2 Implement `configure()` to validate token and repo access via test API call
- [x] 2.3 Implement `getManifest()` to fetch and decode `shotsu-manifest.json` from GitHub
- [x] 2.4 Implement `publish()` for `mode: 'full'` using per-file PUT
- [x] 2.5 Implement `publish()` for `mode: 'incremental'` using per-file PUT and DELETE
- [x] 2.6 Implement SHA lookup (GET file before PUT/DELETE) for existing files
- [x] 2.7 Implement rate limit detection and user-friendly error messages
- [x] 2.8 Implement `url` generation for both user pages and project pages
- [x] 2.9 Write unit tests for `GitHubPagesPublisher`

## 3. Publish Button & Publisher Management UI

- [x] 3.1 Refactor `publish-button.tsx` to show popup menu with configured targets
- [x] 3.2 Add "Configure new publisher" option that opens a configuration form
- [x] 3.3 Create configuration form component for GitHub Pages (token, owner, repo, branch)
- [x] 3.4 Create configuration form component for ZIP (minimal/no config)
- [x] 3.5 Display publish progress (uploading, deleting, completed, error) in the UI
- [x] 3.6 Handle legacy targets without `name`/`config` gracefully
- [x] 3.7 Update `publish-button.tsx` to use `createPublisher` factory and orchestrator

## 4. Integration & Testing

- [x] 4.1 Verify ZIP publisher still works after interface changes
- [x] 4.2 Update `orchestrator.test.ts` for target-id-based lookup
- [x] 4.3 Run all tests and fix any regressions
- [x] 4.4 Update `openspec/specs/publishing-interface/spec.md` with the new requirements
