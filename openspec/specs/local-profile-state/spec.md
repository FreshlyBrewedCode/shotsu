## ADDED Requirements

### Requirement: Profile data model
The system SHALL define a Profile as a JSON-serializable object containing an `id` (UUID string), a `name` (string), a `bio` (string), an `avatarPhotoId` (string or null), and a `sets` array of SetSummary objects. A SetSummary SHALL contain `id` and `title`.

#### Scenario: Profile is initialized with defaults
- **WHEN** no profile exists in the storage adapter
- **THEN** the system SHALL initialize a default profile with a generated UUID, empty `name`, empty `bio`, `avatarPhotoId` set to `null`, and an empty `sets` array

### Requirement: Set data model
The system SHALL define a Set as a JSON-serializable object containing an `id` (UUID string), a `title` (string), a `coverPhotoId` (string or null), and a `sections` array of Section objects. A Section SHALL contain an `id` (UUID string), a `layout` string (one of `"default"` | `"columns"`), and a `photos` array of PhotoRef objects. A PhotoRef SHALL contain only an `id` (UUID string) — no src URL field.

#### Scenario: Set is well-formed after creation
- **WHEN** a new set is created
- **THEN** it SHALL have a unique UUID id, a non-null title (may be empty string), `coverPhotoId` set to `null`, and at least one Section with layout `"default"` and an empty photos array

### Requirement: PhotoRef stores id only
The system SHALL NOT store photo src URLs in the data model. A PhotoRef SHALL contain only `id`. The renderable URL for a photo SHALL be obtained at runtime from the storage adapter via `getBlobURL("photo:{id}")`, which returns a session-scoped object URL.

#### Scenario: Rendering a photo from a PhotoRef
- **WHEN** the editor needs to render a photo with a given PhotoRef
- **THEN** it SHALL call `adapter.getBlobURL("photo:{id}")` to obtain a URL suitable for use in an `<img src>` attribute

#### Scenario: Object URLs are revoked on cleanup
- **WHEN** a component that requested a blob URL is unmounted
- **THEN** the object URL SHALL be revoked via `URL.revokeObjectURL()` to prevent memory leaks

### Requirement: Storage adapter interface
The system SHALL define a `StorageAdapter` interface with the following methods:
- `initialize(): Promise<void>` — set up storage (open DB, request permissions, etc.)
- `getDoc<T>(key: string): Promise<T | null>` — retrieve a JSON document by key
- `setDoc<T>(key: string, value: T): Promise<void>` — persist a JSON document by key
- `deleteDoc(key: string): Promise<void>` — remove a document by key
- `putBlob(key: string, blob: Blob): Promise<void>` — store binary data by key
- `getBlobURL(key: string): Promise<string>` — retrieve a session-scoped object URL for a blob
- `deleteBlob(key: string): Promise<void>` — remove a blob by key

#### Scenario: Adapter initializes before use
- **WHEN** the app starts
- **THEN** `adapter.initialize()` SHALL be called and resolved before any other adapter method is used

#### Scenario: getDoc returns null for missing keys
- **WHEN** `getDoc` is called with a key that does not exist
- **THEN** it SHALL return `null` without throwing

### Requirement: Document key scheme
The system SHALL use the following key conventions with the storage adapter:
- `"profile"` — the singleton Profile document
- `"set:{id}"` — a Set document identified by id
- `"catalog-index"` — the CatalogEntry[] metadata index document
- `"photo:{id}"` — the resized photo blob identified by id

#### Scenario: Profile document round-trips correctly
- **WHEN** the profile is saved with `setDoc("profile", profile)` and then retrieved with `getDoc("profile")`
- **THEN** the retrieved value SHALL equal the saved value

### Requirement: IndexedDB storage adapter
The system SHALL provide a concrete `IndexedDBAdapter` implementing `StorageAdapter`. It SHALL use two IndexedDB object stores: one for documents (keyed by string) and one for blobs (keyed by string). The `idb` library SHALL be used to simplify IndexedDB access.

#### Scenario: Data persists across page reloads
- **WHEN** a document or blob is written via the IndexedDB adapter and the page is reloaded
- **THEN** the same data SHALL be retrievable after reload

#### Scenario: Persistent storage is requested
- **WHEN** the IndexedDB adapter initializes
- **THEN** it SHALL call `navigator.storage.persist()` to request durable storage and log a warning if the request is denied

### Requirement: Profile state context
The system SHALL expose profile state and the storage adapter via a React context (`ProfileProvider`) that provides the current profile, all loaded sets, the adapter instance, and dispatch functions for state mutations. All components within the context tree SHALL be able to read and modify profile state.

#### Scenario: Context provides state to children
- **WHEN** a component renders inside the ProfileProvider
- **THEN** it SHALL be able to read the current profile and sets and call dispatch actions via the provided `useProfile` hook

#### Scenario: UPDATE_PROFILE_NAME action updates name
- **WHEN** the `UPDATE_PROFILE_NAME` action is dispatched with a new name string
- **THEN** the profile's `name` SHALL be updated in state and persisted to the adapter

#### Scenario: UPDATE_PROFILE_BIO action updates bio
- **WHEN** the `UPDATE_PROFILE_BIO` action is dispatched with a new bio string
- **THEN** the profile's `bio` SHALL be updated in state and persisted to the adapter

#### Scenario: UPDATE_PROFILE_AVATAR action updates avatar
- **WHEN** the `UPDATE_PROFILE_AVATAR` action is dispatched with a photo id string or `null`
- **THEN** the profile's `avatarPhotoId` SHALL be updated in state and persisted to the adapter

#### Scenario: SET_COVER action updates set cover
- **WHEN** the `SET_COVER` action is dispatched with a set id and a photo id string or `null`
- **THEN** the set's `coverPhotoId` SHALL be updated in state and persisted to the adapter

#### Scenario: Empty name is allowed
- **WHEN** the `UPDATE_PROFILE_NAME` action is dispatched with an empty string
- **THEN** the profile's `name` SHALL be set to an empty string and persisted

#### Scenario: Empty bio is allowed
- **WHEN** the `UPDATE_PROFILE_BIO` action is dispatched with an empty string
- **THEN** the profile's `bio` SHALL be set to an empty string and persisted

### Requirement: State persistence on mutation
Profile and set state SHALL be persisted to the storage adapter synchronously with each mutation dispatch. Each action that modifies a set SHALL call `adapter.setDoc("set:{id}", updatedSet)`. Actions that modify the profile index SHALL call `adapter.setDoc("profile", updatedProfile)`.

#### Scenario: Set mutation is persisted immediately
- **WHEN** any action that modifies a set is dispatched
- **THEN** the updated set document SHALL be written to the adapter before the next render cycle completes

#### Scenario: State survives a page reload
- **WHEN** the user makes a change to a set and reloads the page
- **THEN** the updated set data SHALL be present after reload

#### Scenario: Missing storage data is handled gracefully
- **WHEN** the adapter returns null for the profile document on load
- **THEN** the system SHALL initialize with a default empty profile without throwing an error

### Requirement: Catalog metadata index
The system SHALL maintain a `CatalogEntry[]` document at key `"catalog-index"` in the storage adapter. Each `CatalogEntry` SHALL contain: `id` (UUID), `filename` (original filename string), `mimeType` (string), `width` (number), `height` (number), `exif` (ExifData object), and `addedAt` (ISO timestamp string). The `ExifData` type SHALL contain optional fields: `dateTaken`, `camera`, `lens`, `focalLength`, `aperture`, `shutterSpeed`, `iso`, `gps` (`{ lat, lng }`).

#### Scenario: Catalog index is updated at ingest
- **WHEN** a photo is successfully ingested
- **THEN** a new CatalogEntry SHALL be appended to the catalog index document

#### Scenario: Catalog index loads on startup
- **WHEN** the ProfileProvider initializes
- **THEN** it SHALL load the catalog index from the adapter so it is available for future catalog browsing features

### Requirement: Photo ingest pipeline
The system SHALL provide a photo ingest function that accepts a `File` object and a target section (set id + section id), and performs the following steps in order:
1. Extract EXIF metadata using the `exifr` library
2. Resize the image so its longest dimension does not exceed 2400px, using `OffscreenCanvas` and `createImageBitmap()`, outputting as `image/webp`
3. Store the resized blob via `adapter.putBlob("photo:{id}", blob)`
4. Append a new `CatalogEntry` to the catalog index via `adapter.setDoc("catalog-index", updatedIndex)`
5. Dispatch `ADD_PHOTO` with the new photo id to add the PhotoRef to the target section

If the image's longest dimension is already ≤ 2400px, the resize step SHALL still convert to WebP but SHALL NOT upscale.

#### Scenario: Ingest stores a blob and updates the index
- **WHEN** a user selects an image file and ingest runs
- **THEN** the resized WebP blob SHALL be stored in the adapter and the catalog index SHALL contain a new entry with the correct metadata

#### Scenario: EXIF extraction failure is non-fatal
- **WHEN** EXIF extraction fails (e.g. file has no EXIF data)
- **THEN** the ingest SHALL continue with an empty ExifData object and SHALL NOT throw

#### Scenario: Images within size limit are not upscaled
- **WHEN** the input image's longest dimension is ≤ 2400px
- **THEN** the output SHALL have the same dimensions as the input (converted to WebP)

### Requirement: Create set
The system SHALL provide a dispatch action to create a new set. The new set SHALL receive a generated UUID, an empty title, and one default Section.

#### Scenario: Creating a new set
- **WHEN** the `CREATE_SET` action is dispatched
- **THEN** the new set SHALL appear in the profile's `sets` list, SHALL be persisted to the adapter, and SHALL be accessible by its id

### Requirement: Update set title
The system SHALL provide a dispatch action to update the title of an existing set by id.

#### Scenario: Updating a set title
- **WHEN** the `UPDATE_SET_TITLE` action is dispatched with a set id and new title string
- **THEN** the set's title SHALL be updated in state and persisted to the adapter

### Requirement: Add section to set
The system SHALL provide a dispatch action to append a new Section to a set. The new Section SHALL have a generated UUID, layout `"default"`, and an empty photos array.

#### Scenario: Adding a section
- **WHEN** the `ADD_SECTION` action is dispatched with a set id
- **THEN** a new Section SHALL be appended to the set's sections array and the set SHALL be persisted

### Requirement: Remove section from set
The system SHALL provide a dispatch action to remove a Section from a set by section id. If the set would have zero sections remaining, the action SHALL be a no-op.

#### Scenario: Removing a section
- **WHEN** the `REMOVE_SECTION` action is dispatched with a set id and section id
- **THEN** the section SHALL no longer appear in the set's sections array and the set SHALL be persisted

#### Scenario: Removing the last section is prevented
- **WHEN** the `REMOVE_SECTION` action is dispatched and the set has only one section
- **THEN** the sections array SHALL remain unchanged

### Requirement: Update section layout
The system SHALL provide a dispatch action to change the layout of a Section.

#### Scenario: Changing section layout
- **WHEN** the `UPDATE_SECTION_LAYOUT` action is dispatched with a set id, section id, and a valid layout string
- **THEN** the section's layout SHALL be updated and the set SHALL be persisted

### Requirement: Reorder sections
The system SHALL provide a dispatch action to move a Section up or down within a set's sections array.

#### Scenario: Moving a section up
- **WHEN** the `MOVE_SECTION` action is dispatched with direction `"up"` for a section that is not already first
- **THEN** the section SHALL swap positions with the section immediately before it and the set SHALL be persisted

#### Scenario: Moving a section at the boundary is a no-op
- **WHEN** the `MOVE_SECTION` action is dispatched with direction `"up"` for the first section
- **THEN** the sections array SHALL remain unchanged

### Requirement: Add photo to section
The system SHALL provide a dispatch action to add a PhotoRef (by id) to a Section. This action is dispatched by the ingest pipeline after the blob has been stored.

#### Scenario: Adding a photo
- **WHEN** the `ADD_PHOTO` action is dispatched with a set id, section id, and photo id
- **THEN** a new PhotoRef `{ id }` SHALL be appended to the section's photos array and the set SHALL be persisted

### Requirement: Remove photo from section
The system SHALL provide a dispatch action to remove a PhotoRef from a Section by photo id. The corresponding blob and catalog entry SHALL NOT be deleted (the photo remains in the catalog for potential reuse).

#### Scenario: Removing a photo from a section
- **WHEN** the `REMOVE_PHOTO` action is dispatched with a set id, section id, and photo id
- **THEN** the PhotoRef SHALL no longer appear in the section's photos array and the set SHALL be persisted
