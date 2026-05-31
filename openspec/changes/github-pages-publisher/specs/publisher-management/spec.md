## ADDED Requirements

### Requirement: Users can configure multiple publisher targets
The system SHALL allow users to create multiple `PublishTarget` instances, each with a unique ID, a user-defined name, a publisher type, and an opaque configuration object.

#### Scenario: Creating a GitHub Pages target
- **WHEN** a user configures a new GitHub Pages publisher with name "My Portfolio", token, owner, and repo
- **THEN** the system SHALL store a new `PublishTarget` with those settings

#### Scenario: Creating multiple targets of the same type
- **WHEN** a user configures two different GitHub Pages publishers pointing to different repositories
- **THEN** the system SHALL store both targets independently

### Requirement: Publisher selection UI
The Publish button SHALL display a popup menu listing all configured publisher targets plus an option to add a new publisher. Selecting a target initiates publish to that target.

#### Scenario: Publishing to a configured target
- **WHEN** a user opens the publish menu and selects a configured target
- **THEN** the system SHALL publish to that target and show progress

#### Scenario: Adding a new publisher
- **WHEN** a user selects "Configure new publisher" from the publish menu
- **THEN** the system SHALL show a configuration form for the chosen publisher type

### Requirement: Publish progress feedback
During publishing, the system SHALL display progress feedback including the current file being uploaded, completion status, and any errors.

#### Scenario: Upload progress shown
- **WHEN** a publisher reports `{ type: 'uploading', file, current, total }`
- **THEN** the UI SHALL display the file name and progress

#### Scenario: Publish completion
- **WHEN** publishing completes successfully
- **THEN** the UI SHALL show the published URL and allow viewing it

### Requirement: Publisher factory registry
The system SHALL provide a factory function that instantiates and configures a `Publisher` given a `publisherId` and a config object.

#### Scenario: Factory creates GitHubPagesPublisher
- **WHEN** the factory is called with `publisherId: 'github-pages'` and valid config
- **THEN** it SHALL return a configured `GitHubPagesPublisher` instance

#### Scenario: Factory creates ZipPublisher
- **WHEN** the factory is called with `publisherId: 'zip'`
- **THEN** it SHALL return a `ZipPublisher` instance

### Requirement: Legacy target compatibility
The system SHALL gracefully handle existing `PublishTarget` entries that lack `name` and `config` fields by treating them as unconfigured or displaying a default name.

#### Scenario: Loading legacy ZIP target
- **WHEN** the system loads a legacy target without `name` and `config`
- **THEN** it SHALL display the publisher's default name and allow publishing
