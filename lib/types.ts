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
  sections: Section[];
};

export type SetSummary = {
  id: string;
  title: string;
};

export type Profile = {
  id: string;
  name: string;
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

export function createSection(): Section {
  return {
    id: crypto.randomUUID(),
    layout: "default",
    photos: [],
  };
}

export function createSet(): Set {
  return {
    id: crypto.randomUUID(),
    title: "",
    sections: [createSection()],
  };
}

export function createProfile(): Profile {
  return {
    id: crypto.randomUUID(),
    name: "",
    sets: [],
  };
}
