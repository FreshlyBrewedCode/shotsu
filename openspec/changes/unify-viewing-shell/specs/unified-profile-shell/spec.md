## ADDED Requirements

### Requirement: ProfileShell renders profile header and sets grid
The system SHALL provide a `ProfileShell` component that renders the profile header (`ProfileHeader`) and a sets grid using `ContentSection` and `SetCard`. It SHALL accept a `makeSetHref` prop that generates set links relative to the current route context.

#### Scenario: Local profile shell renders editable profile
- **WHEN** `ProfileShell` is rendered inside `ProfileProvider` with `makeSetHref={(id) => \`/me/sets/${id}\`}`
- **THEN** it SHALL render `ProfileHeader` (editable inline inputs visible because `dispatch` exists)
- **AND** it SHALL render a `ContentSection` titled "Your Sets" containing `SetCard` children
- **AND** each `SetCard` SHALL link to `/me/sets/{id}`

#### Scenario: Published profile shell renders read-only profile
- **WHEN** `ProfileShell` is rendered inside `PublishedProfileProvider` with `makeSetHref={(id) => \`/p/demo/sets/${id}\`}`
- **THEN** it SHALL render `ProfileHeader` (no edit affordances because `dispatch` is undefined)
- **AND** it SHALL render the sets grid with `SetCard` children linking to `/p/demo/sets/{id}`

### Requirement: ProfileShell shows set previews with Show all action
`ProfileShell` SHALL render approximately 5 set previews (or all if fewer). It SHALL include a "Show all" action linking to `/sets`.

#### Scenario: Profile with multiple sets
- **WHEN** `ProfileShell` renders and the profile has more than 5 sets
- **THEN** it SHALL display approximately 5 `SetCard` previews
- **AND** it SHALL include a "Show all" link to `/sets`

#### Scenario: Profile with no sets
- **WHEN** `ProfileShell` renders and the profile has no sets
- **THEN** it SHALL display an empty-state message within the `ContentSection`

### Requirement: ProfileShell used by /me, /view, and /p routes
`ProfileShell` SHALL be the single component used by `/me`, `/view`, and `/p/<username>` profile pages. The only difference between contexts is the `makeSetHref` prop and the presence/absence of `dispatch`.

#### Scenario: Same component across contexts
- **WHEN** `/me` renders `ProfileShell`
- **AND** `/view` renders `ProfileShell`
- **AND** `/p/demo` renders `ProfileShell`
- **THEN** all three SHALL use the same `ProfileShell` component file
- **AND** the visual output SHALL be identical (excluding edit affordances)
