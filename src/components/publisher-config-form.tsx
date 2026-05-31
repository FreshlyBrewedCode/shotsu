import { useState } from "react";
import { PublishTarget } from "@/lib/types";
import { getPublisherIds } from "@/lib/publisher/registry";

interface PublisherConfigFormProps {
  target?: PublishTarget;
  onSave: (target: PublishTarget) => void;
  onCancel: () => void;
}

export function PublisherConfigForm({ target, onSave, onCancel }: PublisherConfigFormProps) {
  const [publisherType, setPublisherType] = useState(target?.publisherId ?? "");
  const [name, setName] = useState(target?.name ?? "");
  const [token, setToken] = useState(
    typeof target?.config?.token === "string" ? target.config.token : ""
  );
  const [owner, setOwner] = useState(
    typeof target?.config?.owner === "string" ? target.config.owner : ""
  );
  const [repo, setRepo] = useState(
    typeof target?.config?.repo === "string" ? target.config.repo : ""
  );
  const [branch, setBranch] = useState(
    typeof target?.config?.branch === "string" ? target.config.branch : "main"
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const availableTypes = getPublisherIds();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!publisherType) {
      setError("Please select a publisher type.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }

    let config: Record<string, unknown> = {};
    if (publisherType === "github-pages") {
      if (!token.trim() || !owner.trim() || !repo.trim()) {
        setError("Token, owner, and repo are required for GitHub Pages.");
        return;
      }
      config = { token: token.trim(), owner: owner.trim(), repo: repo.trim(), branch: branch.trim() || "main" };
    }

    setSaving(true);
    try {
      // Test configuration if applicable
      if (publisherType === "github-pages") {
        const { createPublisher } = await import("@/lib/publisher/registry");
        await createPublisher(publisherType, config);
      }

      const newTarget: PublishTarget = {
        id: target?.id ?? (crypto.randomUUID ? crypto.randomUUID() : `target-${Date.now()}`),
        publisherId: publisherType,
        name: name.trim(),
        config,
        isRegistered: true,
      };

      onSave(newTarget);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Configuration failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background border border-border rounded-md p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          {target ? "Edit Publisher" : "Configure New Publisher"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Publisher Type</label>
            <select
              value={publisherType}
              onChange={(e) => setPublisherType(e.target.value)}
              disabled={!!target || saving}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select type…</option>
              {availableTypes.map((id) => (
                <option key={id} value={id}>
                  {id === "zip" ? "ZIP Download" : id === "github-pages" ? "GitHub Pages" : id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Portfolio"
              disabled={saving}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {publisherType === "github-pages" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Personal Access Token</label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_..."
                  disabled={saving}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Owner</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="username"
                    disabled={saving}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Repo</label>
                  <input
                    type="text"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="repo-name"
                    disabled={saving}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  disabled={saving}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 rounded-md border border-border text-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
