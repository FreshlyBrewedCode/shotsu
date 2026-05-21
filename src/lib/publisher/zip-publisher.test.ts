import { describe, it, expect } from "vitest";
import { ZipPublisher } from "./zip-publisher";
import { PublishFile } from "./types";

describe("ZipPublisher", () => {
  it("generates a ZIP with all files for full mode", async () => {
    const publisher = new ZipPublisher();

    const files: PublishFile[] = [
      {
        path: "profile.json",
        content: new Blob(["{}"], { type: "application/json" }),
        hash: "abc",
        size: 2,
      },
      {
        path: "sets/set-1.json",
        content: new Blob(["[]"], { type: "application/json" }),
        hash: "def",
        size: 2,
      },
    ];

    const result = await publisher.publish({ mode: "full", files });
    expect(result.url).toBe("file://local-download");
  });

  it("throws for incremental mode", async () => {
    const publisher = new ZipPublisher();
    await expect(
      publisher.publish({ mode: "incremental", puts: [], deletes: [] })
    ).rejects.toThrow("ZipPublisher only supports full publish mode");
  });
});
