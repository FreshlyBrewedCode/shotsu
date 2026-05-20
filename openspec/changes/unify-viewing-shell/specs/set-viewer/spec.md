## MODIFIED Requirements

### Requirement: Set viewer route
The system SHALL provide a read-only page at `/me/sets/[id]` that renders the set identified by `id` using the same visual components as the set editor, but without edit affordances. If no set with that id exists in local state, the page SHALL redirect to the home page.

#### Scenario: Navigating to the viewer for a valid set
- **WHEN** the user navigates to `/me/sets/[id]` for an existing set id
- **THEN** the page SHALL render the set's title, sections, and photos in order

#### Scenario: Navigating to the viewer for a nonexistent set
- **WHEN** the user navigates to `/me/sets/[id]` for an id that does not exist in local state
- **THEN** the system SHALL redirect to the home page

### Requirement: Set viewer is read-only
The set viewer page SHALL not display the edit toolbar, context menu triggers, or inline title editing. It SHALL not dispatch any profile mutations.

#### Scenario: Viewer shows no edit affordances
- **WHEN** the set viewer page loads for a valid set
- **THEN** the edit toolbar SHALL NOT be visible and section/photo elements SHALL NOT respond to right-click or long-press

### Requirement: Set viewer reuses editor rendering components
The set viewer SHALL use the same `Section` and `PhotoBlob` components as the set editor to guarantee identical visual output.

#### Scenario: Viewer and editor render identically
- **WHEN** a set is rendered in the viewer and the same set is rendered in the editor
- **THEN** the layout, section ordering, and photo positioning SHALL be identical (excluding edit chrome)

## ADDED Requirements

### Requirement: Set viewer includes Edit button
When `dispatch` is available (local context), the set viewer SHALL display a floating "Edit" button that navigates to `?mode=edit` without remounting the page.

#### Scenario: Edit button visible on local set viewer
- **WHEN** the user views `/me/sets/[id]` for an existing local set
- **THEN** a floating "Edit" button SHALL be visible
- **AND** clicking it SHALL update the URL to `/me/sets/[id]?mode=edit`
- **AND** the page SHALL NOT remount or reset scroll position

#### Scenario: No Edit button on published set viewer
- **WHEN** the user views `/p/demo/sets/[id]`
- **THEN** no "Edit" button SHALL be visible
