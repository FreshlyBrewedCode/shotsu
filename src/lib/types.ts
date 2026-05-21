export type PhotoRef = {
  id: string;
};

export type Section = {
  id: string;
  layout: "default" | "columns";
  photos: PhotoRef[];
};

export type Set = {
  id: string;
  title: string;
  coverPhotoId: string | null;
  sections: Section[];
};

export type SetSummary = {
  id: string;
  title: string;
};

export type Profile = {
  id: string;
  name: string;
  bio: string;
  avatarPhotoId: string | null;
  sets: SetSummary[];
};

export type ExifData = {
  dateTaken?: string;
  camera?: string;
  lens?: string;
  focalLength?: number;
  aperture?: number;
  shutterSpeed?: string;
  iso?: number;
  gps?: { lat: number; lng: number };
};

export type CatalogEntry = {
  id: string;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  exif: ExifData;
  addedAt: string;
};

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts (e.g. mobile over HTTP)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createSection(): Section {
  return {
    id: generateId(),
    layout: "default",
    photos: [],
  };
}

export function createSet(): Set {
  return {
    id: generateId(),
    title: "",
    coverPhotoId: null,
    sections: [createSection()],
  };
}

export type PublishTarget = {
  id: string;
  publisherId: string;
  isRegistered: boolean;
  manifest?: PublishManifest;
};

export type PublishManifest = {
  generation: number;
  publishedAt: string;
  files: { path: string; hash: string; size: number }[];
};

export function createProfile(): Profile {
  return {
    id: generateId(),
    name: "",
    bio: "",
    avatarPhotoId: null,
    sets: [],
  };
}
