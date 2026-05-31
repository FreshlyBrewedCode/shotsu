import { Publisher, PublisherCapabilities, PublishInstruction, PublishOptions, PublishResult, PublishFile } from "./types";
import { PublishManifest } from "../types";

interface GitHubPagesConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

function base64Encode(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // result is data:url;base64,<content>
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function isRateLimitResponse(response: Response): boolean {
  const remaining = response.headers.get("x-ratelimit-remaining");
  return response.status === 403 && remaining === "0";
}

function getRateLimitErrorMessage(response: Response): string {
  const resetHeader = response.headers.get("x-ratelimit-reset");
  let msg = "GitHub API rate limit exceeded.";
  if (resetHeader) {
    const resetAt = new Date(parseInt(resetHeader, 10) * 1000);
    msg += ` Resets at ${resetAt.toLocaleTimeString()}.`;
  }
  return msg;
}

export class GitHubPagesPublisher implements Publisher {
  id = "github-pages";
  name = "GitHub Pages";
  capabilities: PublisherCapabilities = { incremental: true };

  private config?: GitHubPagesConfig;

  async configure(config: Record<string, unknown>): Promise<void> {
    const token = config.token;
    const owner = config.owner;
    const repo = config.repo;
    const branch = config.branch ?? "main";

    if (typeof token !== "string" || !token) {
      throw new Error("GitHub token is required");
    }
    if (typeof owner !== "string" || !owner) {
      throw new Error("Repository owner is required");
    }
    if (typeof repo !== "string" || !repo) {
      throw new Error("Repository name is required");
    }

    // Validate access by making a test API call
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (isRateLimitResponse(response)) {
      throw new Error(getRateLimitErrorMessage(response));
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error("Invalid GitHub token or insufficient permissions.");
    }

    if (response.status === 404) {
      throw new Error("Repository not found or inaccessible.");
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    this.config = { token, owner, repo, branch };
  }

  async getManifest(): Promise<PublishManifest | null> {
    if (!this.config) {
      throw new Error("Publisher not configured");
    }
    const { token, owner, repo, branch } = this.config;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/shotsu-manifest.json?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (isRateLimitResponse(response)) {
      throw new Error(getRateLimitErrorMessage(response));
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { content?: string; encoding?: string };
    if (typeof data.content !== "string" || data.encoding !== "base64") {
      throw new Error("Unexpected manifest response format from GitHub API");
    }

    const jsonText = atob(data.content);
    return JSON.parse(jsonText) as PublishManifest;
  }

  async publish(
    instruction: PublishInstruction,
    options?: PublishOptions
  ): Promise<PublishResult> {
    if (!this.config) {
      throw new Error("Publisher not configured");
    }

    const { token, owner, repo, branch } = this.config;

    const filesToUpload: PublishFile[] =
      instruction.mode === "full" ? instruction.files : instruction.puts;
    const filesToDelete: string[] =
      instruction.mode === "incremental" ? instruction.deletes : [];

    const totalOps = filesToUpload.length + filesToDelete.length;
    let currentOp = 0;

    for (const file of filesToUpload) {
      currentOp++;
      options?.onProgress?.({
        type: "uploading",
        file: file.path,
        current: currentOp,
        total: totalOps,
      });

      const sha = await this.getFileSha(file.path);
      const content = await base64Encode(file.content);

      const body: Record<string, string> = {
        message: "Update shotsu content",
        content,
        branch,
      };
      if (sha) {
        body.sha = sha;
      }

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(file.path)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (isRateLimitResponse(response)) {
        throw new Error(getRateLimitErrorMessage(response));
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        throw new Error(`Failed to upload ${file.path}: ${response.status} ${errText}`);
      }
    }

    for (const path of filesToDelete) {
      currentOp++;
      options?.onProgress?.({
        type: "deleting",
        file: path,
        current: currentOp,
        total: totalOps,
      });

      const sha = await this.getFileSha(path);
      if (!sha) {
        // File doesn't exist, skip delete
        continue;
      }

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Remove shotsu content",
            sha,
            branch,
          }),
        }
      );

      if (isRateLimitResponse(response)) {
        throw new Error(getRateLimitErrorMessage(response));
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        throw new Error(`Failed to delete ${path}: ${response.status} ${errText}`);
      }
    }

    options?.onProgress?.({ type: "completed" });

    return { url: this.getPublishedUrl() };
  }

  private async getFileSha(path: string): Promise<string | null> {
    if (!this.config) {
      return null;
    }
    const { token, owner, repo, branch } = this.config;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (isRateLimitResponse(response)) {
      throw new Error(getRateLimitErrorMessage(response));
    }

    if (!response.ok) {
      throw new Error(`Failed to get SHA for ${path}: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { sha?: string };
    return data.sha ?? null;
  }

  private getPublishedUrl(): string {
    if (!this.config) {
      return "";
    }
    const { owner, repo } = this.config;
    if (repo === `${owner}.github.io`) {
      return `https://${owner}.github.io/profile.json`;
    }
    return `https://${owner}.github.io/${repo}/profile.json`;
  }
}
