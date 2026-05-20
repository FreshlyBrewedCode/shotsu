## ADDED Requirements

### Requirement: Hard-coded username registry
The system SHALL provide a `lib/registry.ts` module that maps kebab-case usernames to published profile base URLs. The registry SHALL be a static `Record<string, string>` exported as `REGISTRY`.

#### Scenario: Resolving a known username
- **WHEN** `resolveUsername("demo")` is called
- **THEN** it SHALL return the registered base URL for the `demo` user

#### Scenario: Resolving an unknown username
- **WHEN** `resolveUsername("unknown")` is called
- **THEN** it SHALL return `null`

### Requirement: Username registry used by /p/<username> layout
The `/p/[username]` server layout SHALL import `resolveUsername` from `lib/registry.ts`. It SHALL call `resolveUsername` with the route `username` parameter. If the result is `null`, it SHALL call `notFound()` from `next/navigation`.

#### Scenario: Valid username renders published profile
- **WHEN** the user navigates to `/p/demo`
- **THEN** `resolveUsername("demo")` SHALL return a valid base URL
- **AND** the layout SHALL render `PublishedProfileProvider` with that base URL

#### Scenario: Invalid username returns 404
- **WHEN** the user navigates to `/p/nonexistent`
- **THEN** `resolveUsername("nonexistent")` SHALL return `null`
- **AND** the system SHALL return a 404 Not Found page

### Requirement: Registry entries are base URLs
Each registry entry SHALL be a base URL (directory URL with trailing slash implied). The layout SHALL pass this base URL directly to `PublishedProfileProvider` without modification.

#### Scenario: Registry base URL passed to provider
- **WHEN** the registry contains `{ "alice": "https://alice.photos/" }`
- **THEN** navigating to `/p/alice` SHALL render `PublishedProfileProvider` with `baseUrl="https://alice.photos/"`
