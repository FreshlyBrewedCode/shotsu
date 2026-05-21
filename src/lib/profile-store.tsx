"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  ReactNode,
} from "react";
import { StorageAdapter } from "./storage/adapter";
import { Profile, Set, CatalogEntry, createProfile } from "./types";
import { PhotoResolver, LocalResolver } from "./photo-resolver";

type ProfileState = {
  profile: Profile;
  sets: Record<string, Set>;
  catalog: CatalogEntry[];
  initialized: boolean;
};

export type ProfileAction =
  | { type: "INIT"; profile: Profile; sets: Record<string, Set>; catalog: CatalogEntry[] }
  | { type: "CREATE_SET"; set: Set }
  | { type: "UPDATE_SET_TITLE"; setId: string; title: string }
  | { type: "ADD_SECTION"; setId: string; sectionId: string }
  | { type: "REMOVE_SECTION"; setId: string; sectionId: string }
  | { type: "MOVE_SECTION"; setId: string; sectionId: string; direction: "up" | "down" }
  | { type: "UPDATE_SECTION_LAYOUT"; setId: string; sectionId: string; layout: "default" | "columns" }
  | { type: "ADD_PHOTO"; setId: string; sectionId: string; photoId: string }
  | { type: "REMOVE_PHOTO"; setId: string; sectionId: string; photoId: string }
  | { type: "UPDATE_PROFILE_NAME"; name: string }
  | { type: "UPDATE_PROFILE_BIO"; bio: string }
  | { type: "UPDATE_PROFILE_AVATAR"; photoId: string | null }
  | { type: "SET_COVER"; setId: string; photoId: string | null };

export function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case "INIT": {
      return {
        profile: action.profile,
        sets: action.sets,
        catalog: action.catalog,
        initialized: true,
      };
    }
    case "CREATE_SET": {
      const set = action.set;
      const updatedProfile: Profile = {
        ...state.profile,
        sets: [...state.profile.sets, { id: set.id, title: set.title }],
      };
      return {
        ...state,
        profile: updatedProfile,
        sets: { ...state.sets, [set.id]: set },
      };
    }
    case "UPDATE_SET_TITLE": {
      const { setId, title } = action;
      const existing = state.sets[setId];
      if (!existing) return state;
      const updatedSet: Set = { ...existing, title };
      const updatedProfile: Profile = {
        ...state.profile,
        sets: state.profile.sets.map((s) => (s.id === setId ? { ...s, title } : s)),
      };
      return {
        ...state,
        profile: updatedProfile,
        sets: { ...state.sets, [setId]: updatedSet },
      };
    }
    case "ADD_SECTION": {
      const { setId, sectionId } = action;
      const existing = state.sets[setId];
      if (!existing) return state;
      const updatedSet: Set = {
        ...existing,
        sections: [
          ...existing.sections,
          { id: sectionId, layout: "default", photos: [] },
        ],
      };
      return {
        ...state,
        sets: { ...state.sets, [setId]: updatedSet },
      };
    }
    case "REMOVE_SECTION": {
      const { setId, sectionId } = action;
      const existing = state.sets[setId];
      if (!existing || existing.sections.length <= 1) return state;
      const updatedSet: Set = {
        ...existing,
        sections: existing.sections.filter((s) => s.id !== sectionId),
      };
      return {
        ...state,
        sets: { ...state.sets, [setId]: updatedSet },
      };
    }
    case "MOVE_SECTION": {
      const { setId, sectionId, direction } = action;
      const existing = state.sets[setId];
      if (!existing) return state;
      const idx = existing.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return state;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= existing.sections.length) return state;
      const sections = [...existing.sections];
      const [moved] = sections.splice(idx, 1);
      sections.splice(newIdx, 0, moved);
      return {
        ...state,
        sets: { ...state.sets, [setId]: { ...existing, sections } },
      };
    }
    case "UPDATE_SECTION_LAYOUT": {
      const { setId, sectionId, layout } = action;
      const existing = state.sets[setId];
      if (!existing) return state;
      const updatedSet: Set = {
        ...existing,
        sections: existing.sections.map((s) =>
          s.id === sectionId ? { ...s, layout } : s
        ),
      };
      return {
        ...state,
        sets: { ...state.sets, [setId]: updatedSet },
      };
    }
    case "ADD_PHOTO": {
      const { setId, sectionId, photoId } = action;
      const existing = state.sets[setId];
      if (!existing) return state;
      const updatedSet: Set = {
        ...existing,
        sections: existing.sections.map((s) =>
          s.id === sectionId
            ? { ...s, photos: [...s.photos, { id: photoId }] }
            : s
        ),
      };
      return {
        ...state,
        sets: { ...state.sets, [setId]: updatedSet },
      };
    }
    case "REMOVE_PHOTO": {
      const { setId, sectionId, photoId } = action;
      const existing = state.sets[setId];
      if (!existing) return state;
      const updatedSet: Set = {
        ...existing,
        sections: existing.sections.map((s) =>
          s.id === sectionId
            ? { ...s, photos: s.photos.filter((p) => p.id !== photoId) }
            : s
        ),
      };
      return {
        ...state,
        sets: { ...state.sets, [setId]: updatedSet },
      };
    }
    case "UPDATE_PROFILE_NAME": {
      return {
        ...state,
        profile: { ...state.profile, name: action.name },
      };
    }
    case "UPDATE_PROFILE_BIO": {
      return {
        ...state,
        profile: { ...state.profile, bio: action.bio },
      };
    }
    case "UPDATE_PROFILE_AVATAR": {
      return {
        ...state,
        profile: { ...state.profile, avatarPhotoId: action.photoId },
      };
    }
    case "SET_COVER": {
      const { setId, photoId } = action;
      const existing = state.sets[setId];
      if (!existing) return state;
      const updatedSet: Set = { ...existing, coverPhotoId: photoId };
      return {
        ...state,
        sets: { ...state.sets, [setId]: updatedSet },
      };
    }
    default:
      return state;
  }
}

export function getDefaultState(): ProfileState {
  return {
    profile: createProfile(),
    sets: {},
    catalog: [],
    initialized: false,
  };
}

export type ProfileContextValue = {
  state: ProfileState;
  dispatch?: React.Dispatch<ProfileAction>;
  adapter?: StorageAdapter;
};

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({
  children,
  adapter,
}: {
  children: ReactNode;
  adapter: StorageAdapter;
}) {
  const [state, dispatch] = useReducer(profileReducer, null, getDefaultState);
  const resolver = useMemo(() => new LocalResolver(adapter), [adapter]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await adapter.initialize();
      const profileDoc = await adapter.getDoc<Profile>("profile");
      const catalogDoc = await adapter.getDoc<CatalogEntry[]>("catalog-index");

      const profile = profileDoc ?? createProfile();
      const catalog = catalogDoc ?? [];

      // Load all sets referenced in profile
      const sets: Record<string, Set> = {};
      for (const summary of profile.sets) {
        const setDoc = await adapter.getDoc<Set>(`set:${summary.id}`);
        if (setDoc) {
          sets[summary.id] = setDoc;
        }
      }

      if (!cancelled) {
        dispatch({ type: "INIT", profile, sets, catalog });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [adapter]);

  // Persist on mutation
  useEffect(() => {
    if (!state.initialized) return;

    async function persist() {
      await adapter.setDoc("profile", state.profile);
      await adapter.setDoc("catalog-index", state.catalog);
      for (const set of Object.values(state.sets)) {
        await adapter.setDoc(`set:${set.id}`, set);
      }
    }

    persist();
  }, [state, adapter]);

  return (
    <ProfileContext.Provider value={{ state, dispatch, adapter }}>
      <PhotoResolver.Provider value={resolver}>
        {children}
      </PhotoResolver.Provider>
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return ctx;
}

export function useLocalProfile(): Omit<ProfileContextValue, "dispatch" | "adapter"> & {
  dispatch: React.Dispatch<ProfileAction>;
  adapter: StorageAdapter;
} {
  const ctx = useProfile();
  if (!ctx.dispatch || !ctx.adapter) {
    throw new Error("useLocalProfile must be used within a local ProfileProvider");
  }
  return ctx as Omit<ProfileContextValue, "dispatch" | "adapter"> & {
    dispatch: React.Dispatch<ProfileAction>;
    adapter: StorageAdapter;
  };
}
