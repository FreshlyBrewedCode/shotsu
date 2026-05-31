## MODIFIED Requirements

### Requirement: Publisher interface
The system SHALL define a `Publisher` interface with `id`, `name`, `capabilities` (`{ incremental: boolean }`), `configure()`, optional `getManifest()`, and `publish()`.

#### Scenario: Publisher declares capabilities
- **WHEN** a publisher instance is created
- **THEN** its `capabilities` SHALL declare whether it supports incremental publishing

#### Scenario: Publisher accepts configuration
- **WHEN** `configure(config)` is called with a configuration object
- **THEN** the publisher SHALL store the configuration for subsequent `publish()` calls

### Requirement: Publish orchestrator computes diffs
The system SHALL provide a `PublishOrchestrator` that computes file diffs between the current desired `FileBundle` and the previously published manifest. It SHALL produce a `PublishInstruction` shaped according to the publisher's capability.

#### Scenario: Incremental publisher receives puts and deletes
- **WHEN** the orchestrator computes a diff for an incremental publisher and 3 files changed and 1 file was removed
- **THEN** the instruction SHALL be `{ mode: 'incremental', puts: [...3 files...], deletes: ['removed-file'] }`

#### Scenario: Non-incremental publisher receives full bundle
- **WHEN** the orchestrator computes a diff for a non-incremental publisher
- **THEN** the instruction SHALL be `{ mode: 'full', files: [...all files...] }`

#### Scenario: Orchestrator targets a specific publish target
- **WHEN** an orchestrator is created with a `targetId`
- **THEN** it SHALL load and save manifests for that specific target ID, not the publisher ID

### Requirement: Publish manifest tracking
The orchestrator SHALL maintain a `PublishManifest` per publish target in local IndexedDB. The manifest SHALL contain a monotonic `generation` counter, `publishedAt` timestamp, and a list of published files with their SHA-256 hashes and sizes.

#### Scenario: Manifest generation increments
- **WHEN** a publish succeeds
- **THEN** the new manifest's `generation` SHALL equal `previousGeneration + 1`

#### Scenario: Manifest saved locally on success
- **WHEN** a publish completes successfully
- **THEN** the orchestrator SHALL persist the new manifest to IndexedDB

#### Scenario: Manifest stored per target ID
- **WHEN** two targets of the same publisher type exist
- **THEN** each target SHALL maintain its own independent manifest

### Requirement: ZIP publisher implementation
The system SHALL provide a `ZipPublisher` that receives a `{ mode: 'full', files: [...] }` instruction and generates a downloadable ZIP archive containing all files.

#### Scenario: ZIP contains all published files
- **WHEN** the ZIP publisher receives a full instruction with `profile.json`, `sets/abc.json`, and `photos/uuid.webp`
- **THEN** the resulting ZIP SHALL contain these files at their respective paths

#### Scenario: ZIP publisher ignores configuration
- **WHEN** `configure()` is called on `ZipPublisher` with any config
- **THEN** it SHALL resolve successfully as a no-op
