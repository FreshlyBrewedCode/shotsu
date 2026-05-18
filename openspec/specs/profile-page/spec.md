## ADDED Requirements

### Requirement: Profile page route
The system SHALL provide a route at `/profile` that renders the user's profile page.

#### Scenario: Navigating to profile page
- **WHEN** a user navigates to `/profile`
- **THEN** the profile page SHALL render without errors

### Requirement: Profile header layout
The profile page SHALL render a header area containing the user's avatar (1:1 circle crop), name, and bio, arranged in an Instagram-like layout.

#### Scenario: Profile with all fields populated
- **WHEN** the profile page loads and the profile has `avatarPhotoId`, `name`, and `bio`
- **THEN** the avatar SHALL render as a circle, the name SHALL display below or beside the avatar, and the bio SHALL display under the name

#### Scenario: Profile with empty fields
- **WHEN** the profile page loads and `name` is empty
- **THEN** the name area SHALL display a placeholder such as "Untitled Profile"
- **WHEN** the profile page loads and `bio` is empty
- **THEN** the bio area SHALL either be hidden or display a placeholder
- **WHEN** the profile page loads and `avatarPhotoId` is null
- **THEN** the avatar area SHALL display a generic placeholder icon or initials

### Requirement: Edit profile name
The profile page SHALL provide an inline edit interaction to change the profile name. The new name SHALL be persisted via the `UPDATE_PROFILE_NAME` dispatch action.

#### Scenario: Editing the profile name
- **WHEN** a user edits the profile name and confirms the change
- **THEN** the displayed name SHALL update and the profile SHALL be persisted to storage

### Requirement: Edit profile bio
The profile page SHALL provide an inline edit interaction to change the profile bio. The new bio SHALL be persisted via the `UPDATE_PROFILE_BIO` dispatch action.

#### Scenario: Editing the profile bio
- **WHEN** a user edits the profile bio and confirms the change
- **THEN** the displayed bio SHALL update and the profile SHALL be persisted to storage

### Requirement: Set profile avatar
The profile page SHALL allow the user to select a photo from the catalog as their avatar. The selected photo id SHALL be stored in `profile.avatarPhotoId` via the `UPDATE_PROFILE_AVATAR` dispatch action. The avatar SHALL be rendered using the existing `PhotoBlob` component or equivalent blob URL resolution.

#### Scenario: Selecting an avatar
- **WHEN** a user selects a photo from their catalog to use as avatar
- **THEN** `profile.avatarPhotoId` SHALL update and the avatar image SHALL display

### Requirement: ContentSection component
The system SHALL provide a reusable `ContentSection` component that accepts a `title`, an optional `action` slot (React node), and children.

#### Scenario: Rendering a content section
- **WHEN** a `ContentSection` is rendered with a title "Your Sets" and action slot `<Link href="/sets">Show all</Link>`
- **THEN** it SHALL display the title and action in a header row, and render the children below

### Requirement: ContentSection responsive scroll behavior
On viewports narrower than `lg` (1024px), the `ContentSection` children container SHALL scroll horizontally with `overflow-x-auto` and `snap-x`. On viewports `lg` and wider, the children SHALL render in a single non-scrolling flex row inside a centered max-width container.

#### Scenario: Mobile viewport
- **WHEN** the viewport width is less than `lg`
- **THEN** the content section SHALL be horizontally scrollable and only ~1.5 cards SHALL be visible at a time

#### Scenario: Desktop viewport
- **WHEN** the viewport width is `lg` or wider
- **THEN** the content section SHALL show the full preview row without a scrollbar

### Requirement: SetCard component
The system SHALL provide a `SetCard` component that displays a set's cover image (or empty-state), title, and links to the set editor. The effective cover image SHALL be `coverPhotoId ?? firstPhotoInSet.id`. If neither exists, the card SHALL render an empty-state icon with the text "empty".

#### Scenario: Set with explicit cover photo
- **WHEN** a set has `coverPhotoId` pointing to a valid photo
- **THEN** the SetCard SHALL display that photo as the cover image

#### Scenario: Set with no explicit cover but with photos
- **WHEN** a set has no `coverPhotoId` but has photos in its sections
- **THEN** the SetCard SHALL display the first photo in the set as the cover image

#### Scenario: Set with no photos
- **WHEN** a set has no photos in any section
- **THEN** the SetCard SHALL render an empty-state icon and the text "empty"

### Requirement: Profile page shows set previews
The profile page SHALL render a `ContentSection` titled "Your Sets" containing a preview subset of the user's sets as `SetCard` children. The preview SHALL show approximately 5 sets (or all sets if fewer than 5). A "Show all" action SHALL link to `/sets`.

#### Scenario: User has multiple sets
- **WHEN** the profile page loads and the user has more than 5 sets
- **THEN** the content section SHALL show approximately 5 set cards and a "Show all" link

#### Scenario: User has no sets
- **WHEN** the profile page loads and the user has no sets
- **THEN** the content section SHALL still render with an empty-state message

### Requirement: Sets list page route
The system SHALL provide a route at `/sets` that renders a full vertically-scrolling grid of all sets. The grid SHALL be responsive: 3 columns on `lg` and wider, 1 column below `lg`.

#### Scenario: Navigating to sets list page
- **WHEN** a user navigates to `/sets`
- **THEN** the page SHALL render a vertically scrolling grid of all sets without errors

#### Scenario: Sets grid responsive layout
- **WHEN** the viewport is `lg` or wider
- **THEN** the grid SHALL display 3 columns
- **WHEN** the viewport is narrower than `lg`
- **THEN** the grid SHALL display 1 column

### Requirement: Create new set from profile page
The profile page SHALL provide a control to create a new set. Upon creation, the new set SHALL be added to the profile via `CREATE_SET` and the user SHALL be navigated to `/sets/{id}/edit`.

#### Scenario: Creating a set from profile page
- **WHEN** a user triggers the "Create new set" action on the profile page
- **THEN** a new set is created, persisted, and the user is navigated to its editor
