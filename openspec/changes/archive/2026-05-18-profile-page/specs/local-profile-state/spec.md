## MODIFIED Requirements

### Requirement: Profile data model
The system SHALL define a Profile as a JSON-serializable object containing an `id` (UUID string), a `name` (string), a `bio` (string), an `avatarPhotoId` (string or null), and a `sets` array of SetSummary objects. A SetSummary SHALL contain `id` and `title`.

#### Scenario: Profile is initialized with defaults
- **WHEN** no profile exists in the storage adapter
- **THEN** the system SHALL initialize a default profile with a generated UUID, empty `name`, empty `bio`, `avatarPhotoId` set to `null`, and an empty `sets` array

### Requirement: Set data model
The system SHALL define a Set as a JSON-serializable object containing an `id` (UUID string), a `title` (string), a `coverPhotoId` (string or null), and a `sections` array of Section objects. A Section SHALL contain an `id` (UUID string), a `layout` string (one of `"default"` | `"columns"`), and a `photos` array of PhotoRef objects. A PhotoRef SHALL contain only an `id` (UUID string).

#### Scenario: Set is well-formed after creation
- **WHEN** a new set is created
- **THEN** it SHALL have a unique UUID id, a non-null title (may be empty string), `coverPhotoId` set to `null`, and at least one Section with layout `"default"` and an empty photos array

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
