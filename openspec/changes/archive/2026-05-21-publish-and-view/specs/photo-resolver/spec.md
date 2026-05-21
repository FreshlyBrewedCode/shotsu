## MODIFIED Requirements

### Requirement: PhotoResolver context
The system SHALL provide a React context (`PhotoResolver`) that exposes a `resolve(photoId: string): string | Promise<string>` function. Any component that renders a photo from a `PhotoRef` SHALL consume this context instead of accessing the storage adapter directly.

#### Scenario: Component resolves a photo URL via context
- **WHEN** a component calls `usePhotoResolver()` and invokes `resolve("abc-123")`
- **THEN** it SHALL receive a renderable URL string without directly accessing `IndexedDBAdapter`

### Requirement: LocalResolver implementation
The system SHALL provide a `LocalResolver` that implements photo resolution for local IndexedDB storage. It SHALL call `adapter.getBlobURL("photo:{id}")` and return the resulting object URL.

#### Scenario: LocalResolver returns a blob URL
- **WHEN** `LocalResolver.resolve("abc-123")` is called
- **THEN** it SHALL invoke `adapter.getBlobURL("photo:abc-123")` and return the object URL string

## ADDED Requirements

### Requirement: PublishedResolver implementation
The system SHALL provide a `PublishedResolver` that implements photo resolution for published static files. It SHALL resolve `photoId` to `${baseUrl}/photos/{photoId}.webp`.

#### Scenario: PublishedResolver returns an HTTP URL
- **WHEN** `PublishedResolver.resolve("abc-123")` is called with base URL `https://cdn.example.com/`
- **THEN** it SHALL return `https://cdn.example.com/photos/abc-123.webp`
