import { PublishTarget, PublishManifest, Profile, Set } from "../types";
import { StorageAdapter } from "../storage/adapter";
import {
  Publisher,
  PublishInstruction,
  PublishOptions,
  PublishResult,
  FileBundle,
  PublishProgressEvent,
} from "./types";
import { exportProfile } from "../exporter";

const PUBLISH_TARGETS_KEY = "publish-targets";

export class PublishOrchestrator {
  constructor(
    private adapter: StorageAdapter,
    private targetId: string,
    private publisher: Publisher
  ) {}

  private async loadTargets(): Promise<PublishTarget[]> {
    return (await this.adapter.getDoc<PublishTarget[]>(PUBLISH_TARGETS_KEY)) ?? [];
  }

  private async saveTargets(targets: PublishTarget[]): Promise<void> {
    await this.adapter.setDoc(PUBLISH_TARGETS_KEY, targets);
  }

  private findTarget(targets: PublishTarget[]): PublishTarget | undefined {
    return targets.find((t) => t.id === this.targetId);
  }

  private async getLocalManifest(): Promise<PublishManifest | null> {
    const targets = await this.loadTargets();
    const target = this.findTarget(targets);
    return target?.manifest ?? null;
  }

  private async saveManifest(manifest: PublishManifest): Promise<void> {
    const targets = await this.loadTargets();
    const idx = targets.findIndex((t) => t.id === this.targetId);
    if (idx >= 0) {
      targets[idx] = { ...targets[idx], manifest };
    } else {
      targets.push({
        id: this.targetId,
        publisherId: this.publisher.id,
        name: this.publisher.name,
        config: {},
        isRegistered: false,
        manifest,
      });
    }
    await this.saveTargets(targets);
  }

  private computeDiff(
    currentFiles: FileBundle,
    manifest: PublishManifest | null
  ): { puts: FileBundle["files"]; deletes: string[] } {
    const currentMap = new Map(currentFiles.files.map((f) => [f.path, f]));
    const manifestMap = manifest
      ? new Map(manifest.files.map((f) => [f.path, f]))
      : new Map<string, { path: string; hash: string; size: number }>();

    const puts: FileBundle["files"] = [];
    for (const file of currentFiles.files) {
      const existing = manifestMap.get(file.path);
      if (!existing || existing.hash !== file.hash) {
        puts.push(file);
      }
    }

    const deletes: string[] = [];
    for (const path of manifestMap.keys()) {
      if (!currentMap.has(path)) {
        deletes.push(path);
      }
    }

    return { puts, deletes };
  }

  private buildInstruction(
    bundle: FileBundle,
    diff: { puts: FileBundle["files"]; deletes: string[] }
  ): PublishInstruction {
    if (this.publisher.capabilities.incremental) {
      return {
        mode: "incremental",
        puts: diff.puts,
        deletes: diff.deletes,
      };
    }
    return {
      mode: "full",
      files: bundle.files,
    };
  }

  async publish(
    profile: Profile,
    sets: Record<string, Set>,
    options?: PublishOptions
  ): Promise<{
    result: PublishResult;
    manifest: PublishManifest;
    warning?: string;
  }> {
    const localManifest = await this.getLocalManifest();

    // Always try to fetch remote manifest for concurrent publish detection
    let remoteManifest: PublishManifest | null = null;
    if (this.publisher.getManifest) {
      remoteManifest = await this.publisher.getManifest();
    }

    // Use the best available previous manifest for generation counting
    const basisManifest = localManifest ?? remoteManifest;

    // Export profile with previous manifest generation
    const { bundle, manifest } = await exportProfile(
      profile,
      sets,
      this.adapter,
      basisManifest
    );

    // Concurrent publish detection: compare remote generation with local expected
    let warning: string | undefined;
    if (
      localManifest &&
      remoteManifest &&
      remoteManifest.generation > localManifest.generation
    ) {
      warning =
        "Another device published more recently. Proceeding will overwrite those changes.";
      if (options?.onProgress) {
        options.onProgress({ type: "error", error: warning } as PublishProgressEvent);
      }
    }

    // Compute diff against basis manifest
    const diff = this.computeDiff(bundle, basisManifest);

    // Build instruction
    const instruction = this.buildInstruction(bundle, diff);

    // Wire progress
    const wrappedOptions: PublishOptions = {
      ...options,
      onProgress: (event) => {
        options?.onProgress?.(event);
      },
    };

    // Publish
    const result = await this.publisher.publish(instruction, wrappedOptions);

    // Save manifest locally on success
    await this.saveManifest(manifest);

    return {
      result,
      manifest,
      warning,
    };
  }
}
