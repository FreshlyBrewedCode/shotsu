import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "@/lib/profile-store";
import { ZipPublisher } from "@/lib/publisher/zip-publisher";
import { PublishOrchestrator } from "@/lib/publisher/orchestrator";
import { PublishTarget } from "@/lib/types";
import { CloudArrowUp, Eye } from "@phosphor-icons/react";

export function PublishButton() {
  const { state, adapter } = useProfile();

  if (!adapter) {
    return null;
  }
  const { profile, sets, initialized } = state;

  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "publishing" }
    | { type: "done"; url: string }
    | { type: "error"; message: string }
  >({ type: "idle" });

  const handlePublish = useCallback(async () => {
    if (!initialized) return;

    setStatus({ type: "publishing" });

    try {
      const publisher = new ZipPublisher();
      await publisher.configure();
      const orchestrator = new PublishOrchestrator(adapter, publisher);

      const result = await orchestrator.publish(profile, sets, {
        onProgress: (event) => {
          if (event.type === "error") {
            console.warn("Publish progress error:", event.error);
          }
        },
      });

      // Save publish target config to IndexedDB
      const targets = (await adapter.getDoc<PublishTarget[]>("publish-targets")) ?? [];
      const existingIdx = targets.findIndex((t) => t.publisherId === publisher.id);
      if (existingIdx >= 0) {
        targets[existingIdx] = {
          ...targets[existingIdx],
          manifest: result.manifest,
        };
      } else {
        targets.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `target-${Date.now()}`,
          publisherId: publisher.id,
          isRegistered: true,
          manifest: result.manifest,
        });
        // Ensure only one registered target
        for (let i = 0; i < targets.length; i++) {
          if (i !== existingIdx && i !== targets.length - 1) {
            targets[i] = { ...targets[i], isRegistered: false };
          }
        }
      }
      await adapter.setDoc("publish-targets", targets);

      setStatus({ type: "done", url: result.result.url });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Publish failed",
      });
    }
  }, [initialized, profile, sets, adapter]);

  if (!initialized) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {status.type === "done" && (
        <Link
          to={`/view?url=${encodeURIComponent("profile.json")}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-sm hover:bg-accent transition-colors"
        >
          <Eye size={16} weight="bold" />
          View Published
        </Link>
      )}

      <button
        onClick={handlePublish}
        disabled={status.type === "publishing"}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <CloudArrowUp size={16} weight="bold" />
        {status.type === "publishing" ? "Publishing…" : "Publish"}
      </button>

      {status.type === "error" && (
        <span className="text-sm text-destructive">{status.message}</span>
      )}
    </div>
  );
}
