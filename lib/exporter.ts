import { Profile, Set as SetType, PublishManifest } from "./types";
import { StorageAdapter } from "./storage/adapter";
import { PublishFile, FileBundle } from "./publisher/types";

async function computeHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function collectReferencedPhotoIds(profile: Profile, sets: Record<string, SetType>): Set<string> {
  const ids = new Set<string>();
  if (profile.avatarPhotoId) {
    ids.add(profile.avatarPhotoId);
  }
  for (const summary of profile.sets) {
    const set = sets[summary.id];
    if (!set) continue;
    for (const section of set.sections) {
      for (const photo of section.photos) {
        ids.add(photo.id);
      }
    }
    if (set.coverPhotoId) {
      ids.add(set.coverPhotoId);
    }
  }
  return ids;
}

export interface ExportResult {
  bundle: FileBundle;
  manifest: PublishManifest;
}

export async function exportProfile(
  profile: Profile,
  sets: Record<string, SetType>,
  adapter: StorageAdapter,
  previousManifest?: PublishManifest | null
): Promise<ExportResult> {
  const files: PublishFile[] = [];

  // Profile JSON
  const profileJson = JSON.stringify(profile, null, 2);
  const profileBlob = new Blob([profileJson], { type: "application/json" });
  const profileHash = await computeHash(profileBlob);
  files.push({
    path: "profile.json",
    content: profileBlob,
    hash: profileHash,
    size: profileBlob.size,
  });

  // Set JSONs
  for (const summary of profile.sets) {
    const set = sets[summary.id];
    if (!set) continue;
    const setJson = JSON.stringify(set, null, 2);
    const setBlob = new Blob([setJson], { type: "application/json" });
    const setHash = await computeHash(setBlob);
    files.push({
      path: `sets/${set.id}.json`,
      content: setBlob,
      hash: setHash,
      size: setBlob.size,
    });
  }

  // Photos
  const photoIds = collectReferencedPhotoIds(profile, sets);
  for (const photoId of photoIds) {
    const blob = await (async () => {
      try {
        // adapter doesn't have a direct getBlob method, but getBlobURL returns an object URL.
        // We need to fetch the blob from the object URL.
        const url = await adapter.getBlobURL(`photo:${photoId}`);
        const response = await fetch(url);
        const b = await response.blob();
        URL.revokeObjectURL(url);
        return b;
      } catch {
        return null;
      }
    })();
    if (!blob) continue;
    const hash = await computeHash(blob);
    files.push({
      path: `photos/${photoId}.webp`,
      content: blob,
      hash,
      size: blob.size,
    });
  }

  // Manifest
  const generation = previousManifest ? previousManifest.generation + 1 : 1;
  const manifest: PublishManifest = {
    generation,
    publishedAt: new Date().toISOString(),
    files: files.map((f) => ({ path: f.path, hash: f.hash, size: f.size })),
  };

  // Inject manifest into bundle
  const manifestJson = JSON.stringify(manifest, null, 2);
  const manifestBlob = new Blob([manifestJson], { type: "application/json" });
  const manifestHash = await computeHash(manifestBlob);
  files.push({
    path: "shotsu-manifest.json",
    content: manifestBlob,
    hash: manifestHash,
    size: manifestBlob.size,
  });

  return {
    bundle: { files },
    manifest,
  };
}
