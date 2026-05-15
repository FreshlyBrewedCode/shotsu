## ADDED Requirements

### Requirement: Toolbar placement
The edit toolbar SHALL be displayed as a fixed left sidebar on screens `md` and wider, and as a fixed bottom bar on smaller screens. It SHALL only be visible when the user is on a set editor page.

#### Scenario: Toolbar on desktop
- **WHEN** the viewport width is at or above the `md` breakpoint (768px) and the user is in edit mode
- **THEN** the toolbar SHALL render as a fixed panel on the left side of the viewport

#### Scenario: Toolbar on mobile
- **WHEN** the viewport width is below the `md` breakpoint and the user is in edit mode
- **THEN** the toolbar SHALL render as a fixed bar at the bottom of the viewport

### Requirement: Add section action
The toolbar SHALL include an "Add Section" icon button. Activating it SHALL dispatch the `ADD_SECTION` action for the current set, appending a new default section.

#### Scenario: User adds a section via toolbar
- **WHEN** the user clicks the "Add Section" button in the toolbar
- **THEN** a new section with default layout and no photos SHALL be appended to the current set

### Requirement: Toolbar icon buttons
All toolbar actions SHALL be presented as icon buttons with accessible labels (aria-label or tooltip). The toolbar SHALL not display text labels by default to keep it compact.

#### Scenario: Toolbar buttons are accessible
- **WHEN** a toolbar icon button is focused or hovered
- **THEN** a tooltip or aria-label describing the action SHALL be available
