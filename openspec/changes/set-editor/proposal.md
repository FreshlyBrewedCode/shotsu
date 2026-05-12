## Why

Shotsu's core value proposition is local-first, user-owned photography portfolios — but there is currently no way to create or edit sets within the app. Users need a functional set editor as the foundation of the editing experience, enabling them to build and manage their portfolio content locally before publishing.

## What Changes

- Introduce a local profile state model that holds the user's profile and all sets in-memory (and persisted to localStorage)
- Add a set editor page where users can view and edit a single set — its title, sections, and photos within sections
- Support adding, reordering, and removing sections within a set
- Support adding and removing photos within a section
- Support basic section-level layout selection (e.g., default vs. columns)
- Add an edit toolbar (left sidebar on desktop, bottom bar on mobile) with actions relevant to the current editing context
- Add a right-click / long-press context menu for per-element editing options
- Add a "new set" entry point (plus button in nav) that creates a blank set and opens it in the editor
- The set editor renders the set as it would appear when published (live preview while editing)

## Capabilities

### New Capabilities

- `local-profile-state`: Local-first profile and set state management using a React context/store backed by localStorage. Includes the data model for Profile, Set, Section, and PhotoReference.
- `set-editor`: The set editor page and its UI — displays a set with live preview, and allows editing of sections and photos within them.
- `edit-toolbar`: The persistent editing toolbar shown when in edit mode (left sidebar desktop / bottom bar mobile), with icon buttons for adding elements.
- `edit-context-menu`: The per-element context menu triggered by right-click (desktop) or long-press (mobile), presented as a bottom drawer on mobile and a popover on desktop.

### Modified Capabilities

## Impact

- New pages: `/sets/[id]/edit` (set editor) and likely `/sets/[id]` (set viewer, reused in editor as live preview)
- New state layer: React context + localStorage for profile/set state
- Existing `Section` and `Photo` components will be extended or wrapped to support edit-mode interactions
- No backend or API changes — all state is local in this first version
- No publishing or export in scope for this change
