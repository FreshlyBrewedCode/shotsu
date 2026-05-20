## ADDED Requirements

### Requirement: PublishedProfileProvider fetches profile over HTTP
The system SHALL provide a `PublishedProfileProvider` client component that accepts a `baseUrl` prop pointing to a published profile directory. The provider SHALL fetch `profile.json` and all referenced `sets/{id}.json` files, construct a `ProfileContextValue` with `state` populated and `dispatch`/`adapter` undefined, and wrap children in `PhotoResolver.Provider` with a `PublishedResolver`.

#### Scenario: Published profile loads successfully
- **WHEN** `PublishedProfileProvider` is rendered with `baseUrl="https://example.com/profile/"`
- **THEN** it SHALL fetch `https://example.com/profile/profile.json`
- **AND** fetch each referenced set JSON at `https://example.com/profile/sets/{id}.json`
- **AND** expose the loaded profile and sets via `ProfileContext`
- **AND** expose a `PublishedResolver` via `PhotoResolver.Provider`

#### Scenario: Published profile fetch fails
- **WHEN** `PublishedProfileProvider` fails to fetch `profile.json`
- **THEN** it SHALL render an error state indicating the profile could not be loaded

#### Scenario: Child components read published state
- **WHEN** a component calls `useProfile()` inside `PublishedProfileProvider`
- **THEN** `state.profile`, `state.sets`, and `state.initialized` SHALL be defined
- **AND** `dispatch` and `adapter` SHALL be `undefined`

### Requirement: PublishedProfileProvider used by /view and /p routes
The `PublishedProfileProvider` SHALL be the single source of truth for rendering published profiles. Both `/view?url=...` and `/p/<username>` routes SHALL delegate to it rather than inline fetching logic.

#### Scenario: /view uses PublishedProfileProvider
- **WHEN** the user navigates to `/view?url=https://example.com/profile.json`
- **THEN** the page SHALL parse the URL, derive the base URL, and render `PublishedProfileProvider`
- **AND** the same `ProfileShell` components used for local viewing SHALL render the published profile

#### Scenario: /p/<username> uses PublishedProfileProvider
- **WHEN** the user navigates to `/p/demo`
- **THEN** the server layout SHALL resolve the username to a base URL via the registry
- **AND** render `PublishedProfileProvider` with that base URL
- **AND** child pages SHALL render the published profile using `ProfileShell` and `SetShell`

## MODIFIED Requirements

### Requirement: ProfileContextValue optional fields
`ProfileContextValue` SHALL expose `dispatch` and `adapter` as optional fields. Components that render edit affordances SHALL check for their presence before accessing them.

#### Scenario: Local provider has dispatch and adapter
- **WHEN** a component renders inside `ProfileProvider` (local editing context)
- **THEN** `useProfile()` SHALL return a `dispatch` function and an `adapter` instance

#### Scenario: Published provider lacks dispatch and adapter
- **WHEN** a component renders inside `PublishedProfileProvider`
- **THEN** `useProfile()` SHALL return `dispatch` as `undefined` and `adapter` as `undefined`
- **AND** components SHALL NOT throw when checking `if (dispatch)` before rendering edit controls
