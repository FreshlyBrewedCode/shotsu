## 1. PhotoResolver Foundation

- [x] 1.1 Create `lib/photo-resolver.tsx` with `PhotoResolver` context, `usePhotoResolver()` hook, and `LocalResolver` class
- [x] 1.2 Update `ProfileProvider` to wrap children with `PhotoResolver.Provider` using a `LocalResolver` instance
- [x] 1.3 Refactor `PhotoBlob` to use `usePhotoResolver()` instead of `useProfile().adapter`
- [x] 1.4 Update `ProfileProviderWrapper` to expose resolver for tests if needed
- [x] 1.5 Verify no regressions: run existing unit and e2e tests

## 2. Component Viewer-Safety Refactor

- [x] 2.1 Make `ProfileHeader` gracefully handle missing `dispatch` (hide edit affordances when dispatch unavailable)
- [x] 2.2 Make `SetCard` accept an optional `editHref` prop; link to `/sets/${id}` by default, `/sets/${id}/edit` when editing
- [x] 2.3 Ensure `PhotoBlob` works inside and outside `ProfileProvider` contexts where only `PhotoResolver` is available

## 3. Set Viewer Page

- [x] 3.1 Create `components/set-viewer.tsx` read-only component that renders a `Set` with title, sections, and photos using `Section` and `PhotoBlob`
- [x] 3.2 Create `app/sets/[id]/page.tsx` route that loads the set from `useProfile()` state and renders `SetViewer`
- [x] 3.3 Handle missing set: redirect to home page if `state.initialized && !set`
- [x] 3.4 Add e2e test: navigate to `/sets/[id]`, verify no edit toolbar, verify photos render

## 4. Editor Reuses Viewer Components

- [x] 4.1 Refactor `app/sets/[id]/edit/page.tsx` to use `SetViewer` as the base rendering layer, overlaying edit controls (toolbar, context menu, inline title) on top
- [x] 4.2 Verify the editor and viewer render identical output for the same set data
- [x] 4.3 Update `SetCard` usage in `app/profile/page.tsx` and `app/sets/page.tsx` to pass `editHref` where appropriate

## 5. Navigation Updates

- [x] 5.1 Update `SetCard` in set lists to link to viewer (`/sets/${id}`) instead of editor
- [x] 5.2 Add an "Edit" button or link on the set viewer page that navigates to `/sets/${id}/edit`
- [x] 5.3 Ensure the nav "plus" button still creates sets and navigates to the editor

## 6. Cleanup & Verification

- [x] 6.1 Remove any direct `adapter.getBlobURL` calls from UI components outside `LocalResolver`
- [x] 6.2 Run full test suite (`npm run test:unit` and `npm run test:e2e`)
- [x] 6.3 Verify no TypeScript errors (`npm run lint`)
