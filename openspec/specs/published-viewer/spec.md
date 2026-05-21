## ADDED Requirements

### Requirement: Published viewer route
The system SHALL provide a route at `/view` that accepts a `url` query parameter pointing to a published `profile.json`. The page SHALL fetch the profile and its sets and render them using the same components as the local viewer.

#### Scenario: Viewing a published profile
- **WHEN** the user navigates to `/view?url=https://example.com/profile.json`
- **THEN** the page SHALL fetch the profile JSON, load its sets, and render the profile page

#### Scenario: Missing url parameter
- **WHEN** the user navigates to `/view` without a `url` parameter
- **THEN** the page SHALL display an error message indicating a URL is required

### Requirement: PublishedSource data provider
The system SHALL provide a `PublishedSource` that fetches `profile.json` and associated `sets/{id}.json` files over HTTP and exposes them to the viewer components.

#### Scenario: PublishedSource loads profile and sets
- **WHEN** `PublishedSource` is initialized with a base URL
- **THEN** it SHALL fetch `profile.json` and subsequently fetch each referenced set JSON

### Requirement: PublishedResolver
The system SHALL provide a `PublishedResolver` that resolves photo IDs to `${baseUrl}/photos/{id}.webp`.

#### Scenario: PublishedResolver returns a URL
- **WHEN** `PublishedResolver.resolve("abc-123")` is called with base URL `https://example.com/`
- **THEN** it SHALL return `https://example.com/photos/abc-123.webp`

### Requirement: Published viewer is read-only
The published viewer SHALL not render edit affordances (toolbar, context menus, inline editing). It SHALL not dispatch mutations.

#### Scenario: No edit controls on published profile
- **WHEN** a published profile is rendered in the viewer
- **THEN** no edit toolbar, context menu triggers, or inline editing inputs SHALL be visible
