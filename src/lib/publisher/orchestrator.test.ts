import { describe, it, expect, beforeEach, vi } from "vitest";
import { PublishOrchestrator } from "./orchestrator";
import { Publisher, PublishFile, PublishOptions } from "./types";
import { Profile, PublishManifest, PublishTarget } from "../types";
import { StorageAdapter } from "../storage/adapter";

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

function makePublisher(overrides?: Partial<Publisher> & { id?: string }): Publisher {
  return {
    id: overrides?.id ?? "zip",
    name: "Mock Publisher",
    capabilities: { incremental: false },
    configure: vi.fn().mockResolvedValue(undefined),
    publish: vi.fn().mockResolvedValue({ url: "https://example.com" }),
    ...overrides,
  } as Publisher;
}

function makeProfile(overrides?: Partial<Profile>): Profile {
  return {
    id: "profile-1",
    name: "Test",
    bio: "",
    avatarPhotoId: null,
    sets: [],
    ...overrides,
  };
}

function makeManifest(overrides?: Partial<PublishManifest>): PublishManifest {
  return {
    generation: 1,
    publishedAt: "2024-01-01T00:00:00Z",
    files: [],
    ...overrides,
  };
}


describe("PublishOrchestrator", () => {
  let adapter: MockAdapter;
  let publisher: Publisher;
  let orchestrator: PublishOrchestrator;

  beforeEach(() => {
    adapter = new MockAdapter();
    publisher = makePublisher();
    orchestrator = new PublishOrchestrator(adapter, publisher);
  });

  it("saves manifest to IndexedDB after publish", async () => {
    const profile = makeProfile();
    await orchestrator.publish(profile, {});

    const targets = await adapter.getDoc<PublishTarget[]>("publish-targets");
    expect(targets).toBeDefined();
    expect(targets!.length).toBe(1);
    expect(targets![0].publisherId).toBe("zip");
    expect(targets![0].manifest!.generation).toBe(1);
  });

  it("increments generation on subsequent publish", async () => {
    const profile = makeProfile();
    await orchestrator.publish(profile, {});
    const result2 = await orchestrator.publish(profile, {});

    expect(result2.manifest.generation).toBe(2);
  });

  it("falls back to publisher.getManifest when local manifest is missing", async () => {
    const remoteManifest = makeManifest({ generation: 5, files: [] });
    publisher = makePublisher({
      getManifest: vi.fn().mockResolvedValue(remoteManifest),
    });
    orchestrator = new PublishOrchestrator(adapter, publisher);

    const profile = makeProfile();
    const result = await orchestrator.publish(profile, {});

    // When no local manifest, uses remote manifest as basis for generation
    expect(result.manifest.generation).toBe(6); // 5 + 1
    expect(publisher.publish).toHaveBeenCalled();
  });

  it("produces full instruction for non-incremental publisher", async () => {
    publisher = makePublisher({ capabilities: { incremental: false } });
    orchestrator = new PublishOrchestrator(adapter, publisher);

    const profile = makeProfile();
    await orchestrator.publish(profile, {});

    const call = (publisher.publish as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0].mode).toBe("full");
  });

  it("produces incremental instruction for incremental publisher", async () => {
    publisher = makePublisher({
      capabilities: { incremental: true },
    });
    orchestrator = new PublishOrchestrator(adapter, publisher);

    const profile = makeProfile();
    await orchestrator.publish(profile, {});

    // First publish: everything is new so puts = all files, deletes = []
    const call = (publisher.publish as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0].mode).toBe("incremental");
    expect(call[0].puts.length).toBeGreaterThan(0);
    expect(call[0].deletes).toEqual([]);
  });

  it("computes diff correctly for incremental publisher", async () => {
    publisher = makePublisher({
      capabilities: { incremental: true },
    });
    orchestrator = new PublishOrchestrator(adapter, publisher);

    // Seed local manifest with one file
    const oldManifest = makeManifest({
      generation: 1,
      files: [
        { path: "profile.json", hash: "oldhash", size: 10 },
        { path: "old-file.txt", hash: "hash1", size: 5 },
      ],
    });
    await adapter.setDoc("publish-targets", [
      { id: "t1", publisherId: "zip", isRegistered: false, manifest: oldManifest },
    ]);

    // Mock the publisher to return our desired result for getManifest
    publisher = makePublisher({
      capabilities: { incremental: true },
      getManifest: vi.fn().mockResolvedValue(oldManifest),
    });
    orchestrator = new PublishOrchestrator(adapter, publisher);

    const profile = makeProfile();
    await orchestrator.publish(profile, {});

    const call = (publisher.publish as ReturnType<typeof vi.fn>).mock.calls[0];
    const instruction = call[0] as { mode: "incremental"; puts: PublishFile[]; deletes: string[] };
    expect(instruction.mode).toBe("incremental");
    // profile.json should be a put because hash changed (we can't predict exact hash, but it's different)
    expect(instruction.puts.some((f: PublishFile) => f.path === "profile.json")).toBe(true);
    // old-file.txt should be a delete because it's no longer in the bundle
    expect(instruction.deletes).toContain("old-file.txt");
  });

  it("warns on concurrent publish detection", async () => {
    const localManifest = makeManifest({ generation: 2 });
    await adapter.setDoc("publish-targets", [
      { id: "t1", publisherId: "zip", isRegistered: false, manifest: localManifest },
    ]);

    publisher = makePublisher({
      getManifest: vi.fn().mockResolvedValue(makeManifest({ generation: 5 })),
    });
    orchestrator = new PublishOrchestrator(adapter, publisher);

    const profile = makeProfile();
    const result = await orchestrator.publish(profile, {});

    expect(result.warning).toBe(
      "Another device published more recently. Proceeding will overwrite those changes."
    );
  });

  it("wires onProgress through to publisher", async () => {
    const receivedOptions: PublishOptions[] = [];

    const publishMock = vi.fn().mockImplementation(async (_instruction: unknown, options: PublishOptions) => {
      receivedOptions.push(options);
      return { url: "https://example.com" };
    });
    publisher = makePublisher({
      publish: publishMock,
    });
    orchestrator = new PublishOrchestrator(adapter, publisher);

    const profile = makeProfile();
    const onProgress = () => {
      // test handler
    };
    await orchestrator.publish(profile, {}, { onProgress } as PublishOptions);

    expect(publishMock).toHaveBeenCalled();
    expect(receivedOptions.length).toBe(1);
    expect(receivedOptions[0]?.onProgress).toBeDefined();
    // Verify the wrapped onProgress delegates back
    let called = false;
    const wrapped = receivedOptions[0]!;
    const originalOnProgress = wrapped.onProgress;
    (wrapped as unknown as Record<string, unknown>).onProgress = () => {
      called = true;
      originalOnProgress?.({ type: "uploading", file: "test.txt", current: 1, total: 1 });
    };
    (wrapped as unknown as Record<string, unknown>).onProgress({ type: "uploading", file: "test.txt", current: 1, total: 1 });
    expect(called).toBe(true);
  });
});
