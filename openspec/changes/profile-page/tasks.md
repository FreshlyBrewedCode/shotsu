## 1. Extend data model and reducer

- [ ] 1.1 Add `bio: string` and `avatarPhotoId: string | null` to `Profile` type in `lib/types.ts`
- [ ] 1.2 Add `coverPhotoId: string | null` to `Set` type in `lib/types.ts`
- [ ] 1.3 Update `createProfile()` to initialize `bio: ""` and `avatarPhotoId: null`
- [ ] 1.4 Update `createSet()` to initialize `coverPhotoId: null`
- [ ] 1.5 Add `UPDATE_PROFILE_NAME`, `UPDATE_PROFILE_BIO`, `UPDATE_PROFILE_AVATAR`, `SET_COVER` to `ProfileAction` union type in `lib/profile-store.tsx`
- [ ] 1.6 Add reducer cases for the new actions that update `state.profile` and `state.sets` respectively
- [ ] 1.7 Verify persistence: confirm the `useEffect` persistence loop already saves `state.profile` and `state.sets` after each dispatch

## 2. Create shared components

- [ ] 2.1 Create `components/content-section.tsx` with `title`, `action` slot, and responsive scroll container (mobile: `overflow-x-auto snap-x`, desktop: flex row)
- [ ] 2.2 Create `components/set-card.tsx` that computes effective cover (`coverPhotoId ?? firstPhotoInSet.id`), renders cover image via `PhotoBlob`, shows title, links to `/sets/{id}/edit`, and shows empty-state icon + "empty" when there are no photos
- [ ] 2.3 Create `components/profile-header.tsx` with avatar (1:1 circle crop using `PhotoBlob` or placeholder), editable name, and editable bio

## 3. Build profile header interactions

- [ ] 3.1 Render profile name with "Untitled Profile" placeholder when empty
- [ ] 3.2 Implement inline name edit: click to enter edit mode, show `<input>`, save on blur or Enter key, cancel on Escape, dispatch `UPDATE_PROFILE_NAME`
- [ ] 3.3 Implement inline bio edit: same interaction pattern, dispatch `UPDATE_PROFILE_BIO`
- [ ] 3.4 Implement avatar selection: open a modal/picker showing catalog photos, on selection dispatch `UPDATE_PROFILE_AVATAR` with the chosen photo id
- [ ] 3.5 Handle `avatarPhotoId: null` with a generic placeholder (icon or initials)

## 4. Create profile page route

- [ ] 4.1 Create `app/profile/page.tsx` as a Client Component (`"use client"`)
- [ ] 4.2 Import `useProfile` and render `ProfileHeader` + `ContentSection` for "Your Sets"
- [ ] 4.3 Pass the preview subset of sets (up to ~5) as children to `ContentSection`
- [ ] 4.4 Add "Show all" action slot linking to `/sets`
- [ ] 4.5 Add a "Create new set" button on the profile page

## 5. Create sets list page route

- [ ] 5.1 Create `app/sets/page.tsx` as a Client Component (`"use client"`)
- [ ] 5.2 Render a responsive grid: `grid-cols-1 lg:grid-cols-3 gap-4`
- [ ] 5.3 Map all `profile.sets` to `SetCard` components
- [ ] 5.4 Show empty-state message when there are no sets

## 6. Add navigation and polish

- [ ] 6.1 Add a profile link to the existing `Nav` component
- [ ] 6.2 Ensure the profile page container uses a centered max-width on desktop (`max-w-6xl mx-auto`)
- [ ] 6.3 Verify mobile horizontal scroll feels natural with `snap-x snap-mandatory` on set cards
- [ ] 6.4 Verify all new reducer actions are covered by existing persistence logic
- [ ] 6.5 Run `npm run lint` and fix any issues
- [ ] 6.6 Run `npm run test:unit` and fix any failures
