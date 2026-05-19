import type { PublishManifest } from "../types";

export { type PublishManifest } from "../types";

export interface PublishFile {
  path: string;
  content: Blob;
  hash: string;
  size: number;
}

export interface FileBundle {
  files: PublishFile[];
}

export interface PublishProgressEvent {
  type: "uploading" | "deleting" | "completed" | "error";
  file?: string;
  current?: number;
  total?: number;
  error?: string;
}

export interface PublishOptions {
  onProgress?: (event: PublishProgressEvent) => void;
}

export interface PublisherCapabilities {
  incremental: boolean;
}

export type PublishInstruction =
  | { mode: "full"; files: PublishFile[] }
  | { mode: "incremental"; puts: PublishFile[]; deletes: string[] };

export interface PublishResult {
  url: string;
}

export interface Publisher {
  id: string;
  name: string;
  capabilities: PublisherCapabilities;
  configure(): Promise<void>;
  getManifest?(): Promise<PublishManifest | null>;
  publish(
    instruction: PublishInstruction,
    options?: PublishOptions
  ): Promise<PublishResult>;
}
