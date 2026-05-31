## ADDED Requirements

### Requirement: GitHub Pages publisher pushes files to a GitHub repository
The system SHALL provide a `GitHubPagesPublisher` that implements the `Publisher` interface with `incremental: true` capability. It SHALL upload files to a GitHub repository using the GitHub Contents API.

#### Scenario: Full publish to GitHub Pages
- **WHEN** the `GitHubPagesPublisher` receives a `{ mode: 'full', files: [...] }` instruction
- **THEN** it SHALL upload each file to the configured repository and branch using `PUT /repos/{owner}/{repo}/contents/{path}`

#### Scenario: Incremental publish to GitHub Pages
- **WHEN** the `GitHubPagesPublisher` receives a `{ mode: 'incremental', puts: [...], deletes: [...] }` instruction
- **THEN** it SHALL upload each file in `puts` and delete each file in `deletes`

### Requirement: GitHub Pages publisher requires configuration
The `GitHubPagesPublisher` SHALL accept configuration containing `token`, `owner`, `repo`, and optionally `branch` (defaulting to `main`). The `configure()` method SHALL validate the configuration by making a test API call.

#### Scenario: Valid configuration
- **WHEN** `configure()` is called with a valid token and accessible repo
- **THEN** it SHALL resolve successfully

#### Scenario: Invalid token
- **WHEN** `configure()` is called with an invalid token
- **THEN** it SHALL reject with an error indicating the token is invalid

#### Scenario: Inaccessible repository
- **WHEN** `configure()` is called with a token that cannot access the configured repo
- **THEN** it SHALL reject with an error indicating the repository is inaccessible

### Requirement: GitHub Pages publisher reads remote manifest
The `GitHubPagesPublisher` SHALL implement `getManifest()` to fetch `shotsu-manifest.json` from the configured repository and return it as a `PublishManifest`.

#### Scenario: Remote manifest exists
- **WHEN** `getManifest()` is called and `shotsu-manifest.json` exists in the repo
- **THEN** it SHALL return the parsed `PublishManifest`

#### Scenario: Remote manifest missing
- **WHEN** `getManifest()` is called and `shotsu-manifest.json` does not exist
- **THEN** it SHALL return `null`

### Requirement: GitHub Pages publisher returns the published URL
After a successful publish, the `GitHubPagesPublisher` SHALL return a `PublishResult` with a `url` pointing to the published `profile.json` on the GitHub Pages domain.

#### Scenario: URL for user pages
- **WHEN** publishing to `owner/owner.github.io` on the default branch
- **THEN** the result URL SHALL be `https://{owner}.github.io/profile.json`

#### Scenario: URL for project pages
- **WHEN** publishing to `owner/repo` on the default branch
- **THEN** the result URL SHALL be `https://{owner}.github.io/{repo}/profile.json`

### Requirement: GitHub Pages publisher handles SHA requirements
When updating or deleting files via the GitHub Contents API, the publisher SHALL first fetch the current file's SHA, then include it in the PUT or DELETE request.

#### Scenario: Updating an existing file
- **WHEN** the publisher uploads a file that already exists in the repo
- **THEN** it SHALL first GET the file to obtain its SHA, then PUT with that SHA

#### Scenario: Deleting an existing file
- **WHEN** the publisher deletes a file that exists in the repo
- **THEN** it SHALL first GET the file to obtain its SHA, then DELETE with that SHA

### Requirement: GitHub Pages publisher handles rate limits and errors
The publisher SHALL detect GitHub API rate limit errors (403 with `x-ratelimit-remaining: 0`) and throw an error with a user-friendly message. It SHALL also handle 404 (file not found) gracefully during manifest retrieval.

#### Scenario: Rate limit exceeded
- **WHEN** the GitHub API returns a 403 rate limit response
- **THEN** the publisher SHALL throw an error indicating the rate limit was exceeded
