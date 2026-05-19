import { describe, it, expect, beforeEach } from "vitest";
import { exportProfile } from "./exporter";
import { Profile, Set as SetType } from "./types";
import { StorageAdapter } from "./storage/adapter";

class MockAdapter implements StorageAdapter {
  private docs = new Map<string, unknown>();
  private blobs = new Map<string, Blob>();

  async initialize(): Promise<void> {}

  async getDoc<T>(key: string): Promise<T | null> {
    return (this.docs.get(key) as T) ?? null;
  }

  async setDoc<T>(key: string, value: T): Promise<void> {
    this.docs.set(key, value);
  }

  async deleteDoc(key: string): Promise<void> {
    this.docs.delete(key);
  }

  async putBlob(key: string, blob: Blob): Promise<void> {
    this.blobs.set(key, blob);
  }

  async getBlobURL(key: string): Promise<string> {
    const blob = this.blobs.get(key);
    if (!blob) throw new Error(`Blob not found: ${key}`);
    return URL.createObjectURL(blob);
  }

  async deleteBlob(key: string): Promise<void> {
    this.blobs.delete(key);
  }
}

function makeProfile(overrides?: Partial<Profile>): Profile {
  return {
    id: "profile-1",
    name: "Test Profile",
    bio: "A bio",
    avatarPhotoId: null,
    sets: [],
    ...overrides,
  };
}

function makeSet(overrides?: Partial<SetType>): SetType {
  return {
    id: "set-1",
    title: "Test Set",
    coverPhotoId: null,
    sections: [{ id: "sec-1", layout: "default", photos: [] }],
    ...overrides,
  };
}

describe("exportProfile", () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
  });

  it("produces correct file list for profile + sets + photos", async () => {
    const profile = makeProfile({
      sets: [{ id: "set-1", title: "Test Set" }],
    });
    const set = makeSet({
      sections: [
        { id: "sec-1", layout: "default", photos: [{ id: "photo-1" }] },
      ],
    });
    const sets: Record<string, SetType> = { "set-1": set };

    const photoBlob = new Blob(["fake-webp"], { type: "image/webp" });
    await adapter.putBlob("photo:photo-1", photoBlob);

    const result = await exportProfile(profile, sets, adapter);
    const paths = result.bundle.files.map((f) => f.path);

    expect(paths).toContain("profile.json");
    expect(paths).toContain("sets/set-1.json");
    expect(paths).toContain("photos/photo-1.webp");
    expect(paths).toContain("shotsu-manifest.json");
  });

  it("excludes orphan photos not referenced in sets or avatar", async () => {
    const profile = makeProfile({
      sets: [{ id: "set-1", title: "Test Set" }],
    });
    const set = makeSet({
      sections: [
        { id: "sec-1", layout: "default", photos: [{ id: "photo-1" }] },
      ],
    });
    const sets: Record<string, SetType> = { "set-1": set };

    const photoBlob = new Blob(["fake-webp"], { type: "image/webp" });
    await adapter.putBlob("photo:photo-1", photoBlob);
    await adapter.putBlob("photo:photo-orphan", new Blob(["orphan"], { type: "image/webp" }));

    const result = await exportProfile(profile, sets, adapter);
    const paths = result.bundle.files.map((f) => f.path);

    expect(paths).toContain("photos/photo-1.webp");
    expect(paths).not.toContain("photos/photo-orphan.webp");
  });

  it("computes SHA-256 hashes for each file", async () => {
    const profile = makeProfile();
    const result = await exportProfile(profile, {}, adapter);

    for (const file of result.bundle.files) {
      expect(file.hash).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it("starts generation at 1 for first export", async () => {
    const profile = makeProfile();
    const result = await exportProfile(profile, {}, adapter);
    expect(result.manifest.generation).toBe(1);
  });

  it("increments generation from previous manifest", async () => {
    const profile = makeProfile();
    const previous = {
      generation: 3,
      publishedAt: "2024-01-01T00:00:00Z",
      files: [],
    };
    const result = await exportProfile(profile, {}, adapter, previous);
    expect(result.manifest.generation).toBe(4);
  });

  it("includes avatar photo when present", async () => {
    const profile = makeProfile({
      avatarPhotoId: "avatar-1",
      sets: [],
    });
    const avatarBlob = new Blob(["avatar-webp"], { type: "image/webp" });
    await adapter.putBlob("photo:avatar-1", avatarBlob);

    const result = await exportProfile(profile, {}, adapter);
    const paths = result.bundle.files.map((f) => f.path);

    expect(paths).toContain("photos/avatar-1.webp");
  });
});
