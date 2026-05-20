## ADDED Requirements

### Requirement: SetShell renders set in view and edit modes
The system SHALL provide a `SetShell` component that renders a set identically in both view and edit modes. It SHALL accept `setId` and `isEditing` props. When `isEditing` is false, it SHALL render the set in read-only mode. When `isEditing` is true and `dispatch` is available, it SHALL overlay edit controls (toolbar, context menus, inline title input) without remounting the viewer.

#### Scenario: View mode shows set without edit chrome
- **WHEN** `SetShell` is rendered with `isEditing={false}` for a valid set
- **THEN** it SHALL render the set title, sections, and photos using `SetViewer`
- **AND** it SHALL NOT render `EditToolbar`, context menu triggers, or inline title input

#### Scenario: Edit mode shows edit chrome
- **WHEN** `SetShell` is rendered with `isEditing={true}` and `dispatch` is available
- **THEN** it SHALL render the same `SetViewer` content
- **AND** it SHALL render `EditToolbar`, `EditContextMenuOverlay`, file input, and an inline editable title
- **AND** sections and photos SHALL respond to context menus and long-press

#### Scenario: Edit mode hidden when dispatch is unavailable
- **WHEN** `SetShell` is rendered with `isEditing={true}` but `dispatch` is `undefined`
- **THEN** it SHALL behave as if `isEditing` is false (no edit chrome rendered)

### Requirement: Edit mode toggled via ?mode=edit search parameter
Set pages SHALL toggle between view and edit mode using a `?mode=edit` search parameter on the same route. Changing the search parameter SHALL NOT remount the page component or reset scroll position.

#### Scenario: Entering edit mode
- **WHEN** the user is on `/me/sets/abc123`
- **AND** the user clicks the "Edit" button or navigates to `/me/sets/abc123?mode=edit`
- **THEN** `SetShell` SHALL re-render with `isEditing={true}`
- **AND** the page component SHALL NOT remount
- **AND** the scroll position SHALL be preserved

#### Scenario: Exiting edit mode
- **WHEN** the user is on `/me/sets/abc123?mode=edit`
- **AND** the user clicks "Done" or navigates back to `/me/sets/abc123`
- **THEN** `SetShell` SHALL re-render with `isEditing={false}`
- **AND** the page component SHALL NOT remount
- **AND** the scroll position SHALL be preserved

### Requirement: SetShell used by local and published routes
`SetShell` SHALL work in both local and published contexts. In published contexts (`/p/<username>/sets/<id>`, `/view/sets/<id>`), `dispatch` is `undefined`, so it always renders in view mode regardless of the search parameter.

#### Scenario: Published set page is always read-only
- **WHEN** the user navigates to `/p/demo/sets/abc123?mode=edit`
- **THEN** `SetShell` SHALL detect `dispatch` is `undefined`
- **AND** it SHALL render the set in view mode (no edit chrome)
