## ADDED Requirements

### Requirement: Context menu trigger
The system SHALL display a context menu for editable elements (sections and photos) when the user right-clicks (desktop) or performs a long-press of at least 500ms (mobile).

#### Scenario: Right-click opens context menu on desktop
- **WHEN** the user right-clicks on a section or photo element while in edit mode
- **THEN** the context menu SHALL appear positioned near the cursor

#### Scenario: Long-press opens context menu on mobile
- **WHEN** the user presses and holds a section or photo element for 500ms or more
- **THEN** the context menu SHALL appear as a bottom sheet/drawer

#### Scenario: Context menu does not appear in view mode
- **WHEN** the user is not on an edit route
- **THEN** right-click and long-press SHALL not trigger the edit context menu

### Requirement: Context menu presentation
On desktop, the context menu SHALL appear as a popover positioned near the triggering element. On mobile, it SHALL appear as a bottom drawer/sheet that slides up from the bottom of the viewport.

#### Scenario: Mobile context menu is a bottom sheet
- **WHEN** the context menu is triggered on a mobile viewport
- **THEN** it SHALL render as a bottom drawer anchored to the bottom of the screen

#### Scenario: Desktop context menu is a popover
- **WHEN** the context menu is triggered on a desktop viewport
- **THEN** it SHALL render as a floating popover near the element

### Requirement: Section context menu actions
When triggered on a Section element, the context menu SHALL offer the following actions: Remove Section, Move Section Up, Move Section Down, and Change Layout (with a sub-selection for available layouts).

#### Scenario: Section context menu shows section actions
- **WHEN** the context menu is opened on a section
- **THEN** it SHALL show options for Remove, Move Up, Move Down, and Change Layout

#### Scenario: Remove section action
- **WHEN** the user selects "Remove Section" from the context menu
- **THEN** the `REMOVE_SECTION` action SHALL be dispatched (or blocked if it is the last section)

#### Scenario: Change layout action
- **WHEN** the user selects a layout option from the context menu
- **THEN** the `UPDATE_SECTION_LAYOUT` action SHALL be dispatched with the selected layout value

### Requirement: Photo context menu actions
When triggered on a Photo element, the context menu SHALL offer: Remove Photo.

#### Scenario: Photo context menu shows photo actions
- **WHEN** the context menu is opened on a photo
- **THEN** it SHALL show a "Remove Photo" option

#### Scenario: Remove photo action
- **WHEN** the user selects "Remove Photo" from the context menu
- **THEN** the `REMOVE_PHOTO` action SHALL be dispatched for that photo

### Requirement: Add photo to section
The system SHALL provide a way to add a photo to a section. This SHALL be accessible via the section context menu as an "Add Photo" action that opens a simple URL/path input prompt.

#### Scenario: Add photo via context menu
- **WHEN** the user selects "Add Photo" from a section's context menu and provides a src URL
- **THEN** the `ADD_PHOTO` action SHALL be dispatched and the new photo SHALL appear in the section

### Requirement: Dismiss context menu
The context menu SHALL close when the user clicks/taps outside of it, presses Escape, or selects an action.

#### Scenario: Dismiss by clicking outside
- **WHEN** the context menu is open and the user clicks outside of it
- **THEN** the context menu SHALL close without performing any action

#### Scenario: Dismiss by pressing Escape
- **WHEN** the context menu is open and the user presses the Escape key
- **THEN** the context menu SHALL close without performing any action
