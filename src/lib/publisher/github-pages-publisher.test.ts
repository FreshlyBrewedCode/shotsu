import { describe, it, expect, beforeEach, vi } from "vitest";
import { GitHubPagesPublisher } from "./github-pages-publisher";
import { PublishManifest } from "../types";

function mockFetch(response: Response): void {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
}

function mockFetchSequence(responses: Response[]): void {
  let idx = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(() => {
      const res = responses[idx++];
      return Promise.resolve(res);
    })
  );
}

function makeResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function makeTextResponse(
  text: string,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(text, {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function btoaUnicode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

describe("GitHubPagesPublisher", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  describe("configure", () => {
    it("resolves when token and repo are valid", async () => {
      mockFetch(makeResponse({ id: 123 }));
      const publisher = new GitHubPagesPublisher();
      await publisher.configure({
        token: "ghp_valid",
        owner: "testuser",
        repo: "testrepo",
        branch: "main",
      });
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        "https://api.github.com/repos/testuser/testrepo",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer ghp_valid",
          }),
        })
      );
    });

    it("throws for invalid token (401)", async () => {
      mockFetch(makeResponse({ message: "Bad credentials" }, 401));
      const publisher = new GitHubPagesPublisher();
      await expect(
        publisher.configure({ token: "bad", owner: "testuser", repo: "testrepo" })
      ).rejects.toThrow("Invalid GitHub token or insufficient permissions");
    });

    it("throws for inaccessible repo (404)", async () => {
      mockFetch(makeResponse({ message: "Not Found" }, 404));
      const publisher = new GitHubPagesPublisher();
      await expect(
        publisher.configure({ token: "good", owner: "testuser", repo: "missing" })
      ).rejects.toThrow("Repository not found or inaccessible");
    });

    it("throws for rate limit (403 with x-ratelimit-remaining: 0)", async () => {
      mockFetch(
        makeResponse({ message: "API rate limit exceeded" }, 403, {
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": "1700000000",
        })
      );
      const publisher = new GitHubPagesPublisher();
      await expect(
        publisher.configure({ token: "good", owner: "testuser", repo: "testrepo" })
      ).rejects.toThrow("GitHub API rate limit exceeded");
    });

    it("throws when token is missing", async () => {
      const publisher = new GitHubPagesPublisher();
      await expect(publisher.configure({ owner: "testuser", repo: "testrepo" })).rejects.toThrow(
        "GitHub token is required"
      );
    });
  });

  describe("getManifest", () => {
    it("returns parsed manifest when remote manifest exists", async () => {
      const manifest: PublishManifest = {
        generation: 3,
        publishedAt: "2024-01-01T00:00:00Z",
        files: [{ path: "profile.json", hash: "abc", size: 10 }],
      };
      mockFetch(
        makeResponse({
          content: btoaUnicode(JSON.stringify(manifest)),
          encoding: "base64",
        })
      );
      const publisher = new GitHubPagesPublisher();
      await publisher.configure({ token: "t", owner: "o", repo: "r", branch: "main" });
      const result = await publisher.getManifest();
      expect(result).toEqual(manifest);
    });

    it("returns null when manifest does not exist (404)", async () => {
      mockFetchSequence([
        makeResponse({ id: 1 }), // configure
        makeResponse({ message: "Not Found" }, 404), // getManifest
      ]);
      const publisher = new GitHubPagesPublisher();
      await publisher.configure({ token: "t", owner: "o", repo: "r", branch: "main" });
      const result = await publisher.getManifest();
      expect(result).toBeNull();
    });

    it("throws on rate limit", async () => {
      mockFetchSequence([
        makeResponse({ id: 1 }), // configure
        makeResponse({ message: "rate limited" }, 403, {
          "x-ratelimit-remaining": "0",
        }), // getManifest
      ]);
      const publisher = new GitHubPagesPublisher();
      await publisher.configure({ token: "t", owner: "o", repo: "r", branch: "main" });
      await expect(publisher.getManifest()).rejects.toThrow("rate limit exceeded");
    });
  });

  describe("publish", () => {
    it("uploads all files for full mode", async () => {
      // 1. validate repo, 2. get SHA for profile.json (404, new file), 3. PUT profile.json
      mockFetchSequence([
        makeResponse({ id: 1 }), // configure
        makeResponse({ message: "Not Found" }, 404), // getFileSha
        makeResponse({ content: { sha: "newsha" } }), // PUT success
      ]);

      const publisher = new GitHubPagesPublisher();
      await publisher.configure({ token: "t", owner: "o", repo: "r", branch: "main" });

      const result = await publisher.publish({
        mode: "full",
        files: [
          {
            path: "profile.json",
            content: new Blob(['{"name":"test"}'], { type: "application/json" }),
            hash: "abc",
            size: 15,
          },
        ],
      });

      expect(result.url).toBe("https://o.github.io/r/profile.json");
      const calls = vi.mocked(fetch).mock.calls;
      // Last call should be PUT
      const lastCall = calls[calls.length - 1];
      expect(lastCall[1]?.method).toBe("PUT");
    });

    it("uploads puts and deletes for incremental mode", async () => {
      mockFetchSequence([
        makeResponse({ id: 1 }), // configure
        makeResponse({ sha: "oldsha" }), // getFileSha for profile.json (update)
        makeResponse({ content: { sha: "newsha" } }), // PUT profile.json
        makeResponse({ sha: "delsha" }), // getFileSha for old.txt
        makeResponse({ content: { sha: "deleted" } }), // DELETE old.txt
      ]);

      const publisher = new GitHubPagesPublisher();
      await publisher.configure({ token: "t", owner: "o", repo: "r", branch: "main" });

      const progressEvents: { type: string; file?: string }[] = [];
      await publisher.publish(
        {
          mode: "incremental",
          puts: [
            {
              path: "profile.json",
              content: new Blob(['{"name":"test"}'], { type: "application/json" }),
              hash: "abc",
              size: 15,
            },
          ],
          deletes: ["old.txt"],
        },
        {
          onProgress: (event) => {
            progressEvents.push({ type: event.type, file: event.file });
          },
        }
      );

      expect(progressEvents).toContainEqual({ type: "uploading", file: "profile.json" });
      expect(progressEvents).toContainEqual({ type: "deleting", file: "old.txt" });
      expect(progressEvents).toContainEqual({ type: "completed" });
    });

    it("skips delete when file does not exist", async () => {
      mockFetchSequence([
        makeResponse({ id: 1 }), // configure
        makeResponse({ message: "Not Found" }, 404), // getFileSha for missing.txt
        // no DELETE call should happen
      ]);

      const publisher = new GitHubPagesPublisher();
      await publisher.configure({ token: "t", owner: "o", repo: "r", branch: "main" });

      await publisher.publish({
        mode: "incremental",
        puts: [],
        deletes: ["missing.txt"],
      });

      const calls = vi.mocked(fetch).mock.calls;
      // Only configure + getFileSha calls
      expect(calls.length).toBe(2);
    });

    it("throws on rate limit during upload", async () => {
      mockFetchSequence([
        makeResponse({ id: 1 }), // configure
        makeResponse({ message: "Not Found" }, 404), // getFileSha
        makeResponse({ message: "rate limited" }, 403, {
          "x-ratelimit-remaining": "0",
        }), // PUT fails with rate limit
      ]);

      const publisher = new GitHubPagesPublisher();
      await publisher.configure({ token: "t", owner: "o", repo: "r", branch: "main" });

      await expect(
        publisher.publish({
          mode: "full",
          files: [
            {
              path: "profile.json",
              content: new Blob(['{}'], { type: "application/json" }),
              hash: "abc",
              size: 2,
            },
          ],
        })
      ).rejects.toThrow("rate limit exceeded");
    });

    it("returns user pages URL for owner.github.io repo", async () => {
      mockFetchSequence([
        makeResponse({ id: 1 }), // configure
        makeResponse({ message: "Not Found" }, 404), // getFileSha
        makeResponse({ content: { sha: "newsha" } }), // PUT success
      ]);

      const publisher = new GitHubPagesPublisher();
      await publisher.configure({ token: "t", owner: "testuser", repo: "testuser.github.io", branch: "main" });

      const result = await publisher.publish({
        mode: "full",
        files: [
          {
            path: "profile.json",
            content: new Blob(['{}'], { type: "application/json" }),
            hash: "abc",
            size: 2,
          },
        ],
      });

      expect(result.url).toBe("https://testuser.github.io/profile.json");
    });
  });
});
