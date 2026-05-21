## MODIFIED Requirements

### Requirement: Profile state context
The system SHALL expose profile state, the storage adapter, and the photo resolver via a React context (`ProfileProvider`). All components within the context tree SHALL be able to read profile state, call dispatch actions for mutations, and resolve photo URLs.

#### Scenario: Context provides state and resolver to children
- **WHEN** a component renders inside the ProfileProvider
- **THEN** it SHALL be able to read the current profile and sets, call dispatch actions, and resolve photo URLs via `usePhotoResolver()`

## ADDED Requirements

### Requirement: Publish target storage
The system SHALL store `PublishTarget` records in IndexedDB to track configured publishing targets, their manifests, and which target is registered as the canonical public profile.

#### Scenario: Publish target persisted
- **WHEN** a user configures a publishing target and publishes
- **THEN** the target config and latest manifest SHALL be stored in IndexedDB under a `publish-targets` document

### Requirement: Only one registered target
The system SHALL enforce that at most one `PublishTarget` has `isRegistered: true` at any time. Setting a target as registered SHALL unset any previously registered target.

#### Scenario: Registering a new target unregisters the old
- **WHEN** a user registers target B while target A is already registered
- **THEN** target A SHALL have `isRegistered: false` and target B SHALL have `isRegistered: true`
