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

# Technical background

- simple and open profile format. shotsu profiles are a JSON index file, with additonal JSON files for each set
- photos are referenced using relative urls
- a full shotsu profile is just JSON files + photos and can be easily exported or published for hosting/serving by different publishing providers (this is how shotsu stays open and decentralized). Its just static files.
- the main shotsu client app is a web app. The app can be used for viewing and editing profiles.
  - viewing: the app just fetches the JSON and renders the profile accoringly. It might transform the photo ulrs based on the used publishing provider
  - editing: the editing workflow is local first. The app maintains a local copy of the profile and photo catalog. Since the data format is extremly simple and lightweight the required files for a full shotsu profile can be easily generated on the fly. Users can configure different publishing providers in the app and publish their edits. A publishing abstraction is used so different providers only need to implement the publishing interface.
