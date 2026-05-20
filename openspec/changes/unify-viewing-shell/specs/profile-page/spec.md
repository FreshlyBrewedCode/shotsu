## MODIFIED Requirements

### Requirement: Profile page route
The system SHALL provide a route at `/me` that renders the user's local profile page. The page SHALL remain in edit/local mode by default.

#### Scenario: Navigating to profile page
- **WHEN** a user navigates to `/me`
- **THEN** the profile page SHALL render without errors

### Requirement: Profile page shows set previews
The profile page SHALL render a `ContentSection` titled "Your Sets" containing a preview subset of the user's sets as `SetCard` children. The preview SHALL show approximately 5 sets (or all sets if fewer than 5). A "Show all" action SHALL link to `/sets`.

#### Scenario: User has multiple sets
- **WHEN** the profile page loads and the user has more than 5 sets
- **THEN** the content section SHALL show approximately 5 set cards and a "Show all" link

#### Scenario: User has no sets
- **WHEN** the profile page loads and the user has no sets
- **THEN** the content section SHALL still render with an empty-state message

### Requirement: Create new set from profile page
The profile page SHALL provide a control to create a new set. Upon creation, the new set SHALL be added to the profile via `CREATE_SET` and the user SHALL be navigated to `/me/sets/{id}?mode=edit`.

#### Scenario: Creating a set from profile page
- **WHEN** a user triggers the "Create new set" action on the profile page
- **THEN** a new set is created, persisted, and the user is navigated to `/me/sets/{new-set-id}?mode=edit`

## ADDED Requirements

### Requirement: Local route group layout
The system SHALL provide a `(local)/layout.tsx` route group layout that wraps all local pages (`/me/*`, `/sets`) in `ProfileProvider` and `Nav`. The root `app/layout.tsx` SHALL contain only the HTML shell, fonts, and global CSS with no providers.

#### Scenario: Local pages have ProfileProvider
- **WHEN** the user navigates to `/me`
- **THEN** the page SHALL render inside `ProfileProvider` with IndexedDB-backed state
- **AND** the `Nav` SHALL show the create-set button and link to `/me`

#### Scenario: Root layout has no providers
- **WHEN** the root layout renders
- **THEN** it SHALL NOT wrap children in `ProfileProvider` or any other data provider
- **AND** providers SHALL be injected by route-group layouts instead
