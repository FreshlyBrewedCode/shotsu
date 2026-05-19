# shotsu

shotsu is an open, and minimal photography portfolio platform where users own their photos and profile and are not locked in by the platform.

# User experience

- shotsu is based around profiles. Visiting a profile will show the profile page from where you can navigate to the profiles sets.
- users can create "sets" of photos. During creation or editing of a set, users can add photos, change the layout and order of photos as well as other parameters about the apperance of the set. Each set displays on a single page where you scroll from top to bottom.
  - a set consists of one or more sections. a section is a logical grouping of photos. it is possible to edit parameters per section (e.g. layout)
  - each set has a title
- editing:
  - sets can be created via the "plus" button in the nav bar
  - toolbar: when in edit mode, a toolbar is displayed (left side on desktop, bottom on mobile) with icon buttons for general edit options (e.g. add button)
  - edit element: a right click (long press on mobile) brings up an edit context menu (bottom drawer/sheet on mobile) with editing optios for the selected element

# Architecture

- simple and open profile format. shotsu profiles are a JSON index file, with additonal JSON files for each set. photos are referenced by id only.
- unified viewer and editor. the same components render local and published profiles. editing is viewing with edit affordances overlaid.
- photo resolution is provider-agnostic. a PhotoResolver context turns photo ids into renderable urls.
- local-first editing. the app maintains a local copy in IndexedDB (profile json, set jsons, photo blobs). all mutations are persisted immediately.
- publishing is a transform. the exporter generates a publishable bundle. the orchestrator computes diffs and hands instructions to a publisher based on its capability (full rewrite or incremental puts/deletes).
- publishers are stateless. the orchestrator tracks the published manifest locally and can recover it from remote for cross-client publishing.

# Future

- real providers: s3/r2, github pages, and a shotsu cloud backend for username-based discovery.
