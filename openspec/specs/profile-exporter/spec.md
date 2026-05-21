## ADDED Requirements

### Requirement: Profile exporter
The system SHALL provide an exporter function that transforms local profile state into a `FileBundle` containing `profile.json`, `sets/{id}.json` for each set, and `photos/{id}.webp` for each referenced photo.

#### Scenario: Exporter produces correct file list
- **WHEN** the exporter runs for a profile with 2 sets and 5 referenced photos
- **THEN** the `FileBundle` SHALL contain exactly 1 profile JSON, 2 set JSONs, and 5 photo webp files

### Requirement: Exporter includes only referenced photos
The exporter SHALL scan all sets and the profile avatar to determine which photos are referenced. It SHALL NOT include catalog photos that are not referenced by any set or the avatar.

#### Scenario: Orphan photos excluded
- **WHEN** the catalog contains 10 photos but only 3 are referenced in sets
- **THEN** the `FileBundle` SHALL contain only 3 photo files

### Requirement: File hash computation
The exporter SHALL compute a SHA-256 hash for each file in the bundle. These hashes SHALL be stored in the `PublishManifest` for diffing.

#### Scenario: Hash computed for each file
- **WHEN** the exporter processes a photo blob
- **THEN** the resulting `PublishFile` SHALL include a `hash` field with the SHA-256 hex string

### Requirement: Published JSON shape matches local JSON
The exported `profile.json` and `sets/{id}.json` SHALL be byte-identical to the local JSON documents (same structure, same photo IDs). No URL fields SHALL be added.

#### Scenario: Published profile is valid local JSON
- **WHEN** a published `profile.json` is fetched
- **THEN** it SHALL parse as a valid `Profile` object with `PhotoRef` entries containing only `id`
