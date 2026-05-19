## MODIFIED Requirements

### Requirement: Live preview rendering
The set editor SHALL render the set's sections and photos using the same `Section` and `PhotoBlob` components as the read-only set viewer, providing a live preview of how the set will appear when published. The editor SHALL overlay edit controls (toolbar, context menus, inline title input) on top of these shared components.

#### Scenario: Editor shows current set content
- **WHEN** the set editor page loads
- **THEN** all sections and their photos SHALL be rendered in order using the same components as the set viewer, with each section's layout setting applied

#### Scenario: Edit mode indicator
- **WHEN** the set editor page is active
- **THEN** the edit toolbar SHALL be visible and section/photo elements SHALL show edit interaction affordances (hover states, context menu triggers)

### Requirement: Set editor route
The system SHALL provide a page at `/sets/[id]/edit` that renders the set editor for the set identified by `id`. If no set with that id exists in local state, the page SHALL display an error or redirect to the home page.

#### Scenario: Navigating to the editor for a valid set
- **WHEN** the user navigates to `/sets/[id]/edit` for an existing set id
- **THEN** the set editor page SHALL render the set's content with edit controls visible

#### Scenario: Navigating to the editor for a nonexistent set
- **WHEN** the user navigates to `/sets/[id]/edit` for an id that does not exist in local state
- **THEN** the system SHALL redirect to the home page or display a "Set not found" message
