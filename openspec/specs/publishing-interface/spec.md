## ADDED Requirements

### Requirement: Publisher interface
The system SHALL define a `Publisher` interface with `id`, `name`, `capabilities` (`{ incremental: boolean }`), `configure()`, optional `getManifest()`, and `publish()`.

#### Scenario: Publisher declares capabilities
- **WHEN** a publisher instance is created
- **THEN** its `capabilities` SHALL declare whether it supports incremental publishing

### Requirement: Publish orchestrator computes diffs
The system SHALL provide a `PublishOrchestrator` that computes file diffs between the current desired `FileBundle` and the previously published manifest. It SHALL produce a `PublishInstruction` shaped according to the publisher's capability.

#### Scenario: Incremental publisher receives puts and deletes
- **WHEN** the orchestrator computes a diff for an incremental publisher and 3 files changed and 1 file was removed
- **THEN** the instruction SHALL be `{ mode: 'incremental', puts: [...3 files...], deletes: ['removed-file'] }`

#### Scenario: Non-incremental publisher receives full bundle
- **WHEN** the orchestrator computes a diff for a non-incremental publisher
- **THEN** the instruction SHALL be `{ mode: 'full', files: [...all files...] }`

### Requirement: Publish manifest tracking
The orchestrator SHALL maintain a `PublishManifest` per publish target in local IndexedDB. The manifest SHALL contain a monotonic `generation` counter, `publishedAt` timestamp, and a list of published files with their SHA-256 hashes and sizes.

#### Scenario: Manifest generation increments
- **WHEN** a publish succeeds
- **THEN** the new manifest's `generation` SHALL equal `previousGeneration + 1`

#### Scenario: Manifest saved locally on success
- **WHEN** a publish completes successfully
- **THEN** the orchestrator SHALL persist the new manifest to IndexedDB

### Requirement: Manifest published with bundle
The exporter SHALL inject `shotsu-manifest.json` into the `FileBundle` containing the current `PublishManifest`.

#### Scenario: Bundle contains manifest file
- **WHEN** the exporter produces a `FileBundle`
- **THEN** it SHALL contain a file at path `shotsu-manifest.json` with the manifest JSON as its content

### Requirement: Publisher getManifest for state recovery
Publishers that expose remote file access SHALL implement `getManifest()` to fetch the currently published `shotsu-manifest.json` from the remote destination.

#### Scenario: Cross-client publish recovery
- **WHEN** a client has no local manifest for a target but the publisher implements `getManifest()`
- **THEN** the orchestrator SHALL call `getManifest()` and use the returned manifest as the basis for computing diffs

### Requirement: ZIP publisher implementation
The system SHALL provide a `ZipPublisher` that receives a `{ mode: 'full', files: [...] }` instruction and generates a downloadable ZIP archive containing all files.

#### Scenario: ZIP contains all published files
- **WHEN** the ZIP publisher receives a full instruction with `profile.json`, `sets/abc.json`, and `photos/uuid.webp`
- **THEN** the resulting ZIP SHALL contain these files at their respective paths

### Requirement: Concurrent publish detection
The orchestrator SHALL compare the remote manifest's `generation` with the locally expected generation before publishing. If `remote.generation > localExpected`, it SHALL warn the user that another device published more recently.

#### Scenario: Another device published first
- **WHEN** `publisher.getManifest()` returns a manifest with generation 5, but the local expected generation is 3
- **THEN** the orchestrator SHALL surface a warning before proceeding with the publish

### Requirement: Publish progress reporting
The orchestrator SHALL support an `onProgress` callback that receives events during publishing: `uploading`, `deleting`, `completed`, and `error`.

#### Scenario: Upload progress reported
- **WHEN** a publisher uploads files
- **THEN** `onProgress` SHALL be called with `{ type: 'uploading', file, current, total }` for each file
