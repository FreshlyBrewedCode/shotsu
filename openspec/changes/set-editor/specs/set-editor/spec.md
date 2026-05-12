## ADDED Requirements

### Requirement: Set editor route
The system SHALL provide a page at `/sets/[id]/edit` that renders the set editor for the set identified by `id`. If no set with that id exists in local state, the page SHALL display an error or redirect to the home page.

#### Scenario: Navigating to the editor for a valid set
- **WHEN** the user navigates to `/sets/[id]/edit` for an existing set id
- **THEN** the set editor page SHALL render the set's content with edit controls visible

#### Scenario: Navigating to the editor for a nonexistent set
- **WHEN** the user navigates to `/sets/[id]/edit` for an id that does not exist in local state
- **THEN** the system SHALL redirect to the home page or display a "Set not found" message

### Requirement: Live preview rendering
The set editor SHALL render the set's sections and photos in the same visual layout as the read-only set viewer, providing a live preview of how the set will appear when published.

#### Scenario: Editor shows current set content
- **WHEN** the set editor page loads
- **THEN** all sections and their photos SHALL be rendered in order, using each section's layout setting

### Requirement: Editable set title
The set editor SHALL display the set title as an editable inline text input at the top of the page.

#### Scenario: User edits the set title
- **WHEN** the user types in the set title input
- **THEN** the set's title in local state SHALL update in real time

### Requirement: New set creation from nav
The system SHALL provide a "plus" button in the top navigation bar. Clicking it SHALL create a new set in local state and navigate the user to the new set's editor page.

#### Scenario: User clicks the plus button
- **WHEN** the user clicks the plus/new-set button in the nav
- **THEN** a new set SHALL be created with a default empty title and one default section
- **AND** the user SHALL be navigated to `/sets/[new-set-id]/edit`

### Requirement: Sections rendered in editor
Each Section in a set SHALL be rendered as a distinct block in the editor, with visual separation and section-level controls accessible via the edit toolbar or context menu.

#### Scenario: Multiple sections are shown in order
- **WHEN** a set has multiple sections
- **THEN** they SHALL be rendered top-to-bottom in array order

### Requirement: Edit mode indicator
The set editor SHALL visually distinguish edit mode from the read-only viewer (e.g., via the presence of the toolbar and edit affordances on elements).

#### Scenario: Edit affordances are visible
- **WHEN** the set editor page is active
- **THEN** the edit toolbar SHALL be visible and section/photo elements SHALL show edit interaction affordances (hover states, context menu triggers)
