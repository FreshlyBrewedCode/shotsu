## MODIFIED Requirements

### Requirement: PhotoRef stores id only
The system SHALL NOT store photo src URLs in the data model. A PhotoRef SHALL contain only `id`. The renderable URL for a photo SHALL be obtained at runtime from the `PhotoResolver` context via `resolve("{id}")`.

#### Scenario: Rendering a photo from a PhotoRef
- **WHEN** a component needs to render a photo with a given PhotoRef
- **THEN** it SHALL call `resolve("{id}")` from the `PhotoResolver` context to obtain a URL suitable for use in an `<img src>` attribute

#### Scenario: Object URLs are revoked on cleanup
- **WHEN** a component that requested a blob URL is unmounted
- **THEN** the object URL SHALL be revoked via `URL.revokeObjectURL()` to prevent memory leaks

### Requirement: Profile state context
The system SHALL expose profile state, the storage adapter, and the photo resolver via a React context (`ProfileProvider`). All components within the context tree SHALL be able to read profile state, call dispatch actions for mutations, and resolve photo URLs.

#### Scenario: Context provides state and resolver to children
- **WHEN** a component renders inside the ProfileProvider
- **THEN** it SHALL be able to read the current profile and sets, call dispatch actions, and resolve photo URLs via `usePhotoResolver()`

## ADDED Requirements

### Requirement: PhotoBlob uses PhotoResolver
The `PhotoBlob` component SHALL consume the `PhotoResolver` context to obtain photo URLs. It SHALL NOT directly access `useProfile().adapter`.

#### Scenario: PhotoBlob renders with resolver
- **WHEN** `PhotoBlob` renders with `photoId="abc-123"`
- **THEN** it SHALL call `resolve("abc-123")` from the `PhotoResolver` context and use the returned URL as the image source
