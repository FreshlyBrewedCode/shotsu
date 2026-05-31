import JSZip from "jszip";
import {
  Publisher,
  PublisherCapabilities,
  PublishInstruction,
  PublishOptions,
  PublishResult,
} from "./types";

export class ZipPublisher implements Publisher {
  id = "zip";
  name = "ZIP Download";
  capabilities: PublisherCapabilities = { incremental: false };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async configure(_config: Record<string, unknown>): Promise<void> {
    // no-op for ZIP publisher
  }

  async publish(
    instruction: PublishInstruction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: PublishOptions
  ): Promise<PublishResult> {
    if (instruction.mode !== "full") {
      throw new Error("ZipPublisher only supports full publish mode");
    }

    const zip = new JSZip();

    for (const file of instruction.files) {
      zip.file(file.path, file.content);
    }

    const blob = await zip.generateAsync({ type: "blob" });

    // Trigger browser download
    if (typeof window !== "undefined") {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shotsu-export.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return { url: "file://local-download" };
  }
}
