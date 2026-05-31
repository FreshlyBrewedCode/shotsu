import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "@/lib/profile-store";
import { createPublisher } from "@/lib/publisher/registry";
import { PublishOrchestrator } from "@/lib/publisher/orchestrator";
import { PublishTarget } from "@/lib/types";
import { PublisherConfigForm } from "./publisher-config-form";
import { CloudArrowUp, Eye, Plus, Check, Warning } from "@phosphor-icons/react";

type PublishStatus =
  | { type: "idle" }
  | { type: "publishing"; message: string }
  | { type: "done"; url: string }
  | { type: "error"; message: string };

function getDefaultTargetName(target: PublishTarget): string {
  if (target.name) return target.name;
  if (target.publisherId === "zip") return "ZIP Download";
  if (target.publisherId === "github-pages") return "GitHub Pages";
  return target.publisherId;
}

function normalizeLegacyTargets(targets: PublishTarget[]): PublishTarget[] {
  return targets.map((t) => ({
    ...t,
    name: t.name || getDefaultTargetName(t),
    config: t.config || {},
  }));
}

export function PublishButton() {
  const { state, adapter } = useProfile();

  if (!adapter) {
    return null;
  }
  const { profile, sets, initialized } = state;

  const [menuOpen, setMenuOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [targets, setTargets] = useState<PublishTarget[]>([]);
  const [status, setStatus] = useState<PublishStatus>({ type: "idle" });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adapter) return;
    adapter.getDoc<PublishTarget[]>("publish-targets").then((t) => {
      setTargets(normalizeLegacyTargets(t ?? []));
    });
  }, [adapter]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handlePublishToTarget = useCallback(
    async (target: PublishTarget) => {
      setMenuOpen(false);
      setStatus({ type: "publishing", message: "Preparing…" });

      try {
        const publisher = await createPublisher(target.publisherId, target.config);
        const orchestrator = new PublishOrchestrator(adapter, target.id, publisher);

        const result = await orchestrator.publish(profile, sets, {
          onProgress: (event) => {
            if (event.type === "uploading") {
              setStatus({
                type: "publishing",
                message: `Uploading ${event.file ?? ""} (${event.current ?? 0}/${event.total ?? 0})`,
              });
            } else if (event.type === "deleting") {
              setStatus({
                type: "publishing",
                message: `Deleting ${event.file ?? ""} (${event.current ?? 0}/${event.total ?? 0})`,
              });
            } else if (event.type === "completed") {
              setStatus({ type: "publishing", message: "Finalizing…" });
            } else if (event.type === "error") {
              setStatus({ type: "error", message: event.error ?? "Publish failed" });
            }
          },
        });

        // Ensure target is marked registered and update local state with latest manifest
        const currentTargets = (await adapter.getDoc<PublishTarget[]>("publish-targets")) ?? [];
        const normalized = normalizeLegacyTargets(currentTargets);
        const idx = normalized.findIndex((t) => t.id === target.id);
        if (idx >= 0) {
          normalized[idx] = { ...normalized[idx], isRegistered: true, manifest: result.manifest };
        }
        await adapter.setDoc("publish-targets", normalized);
        setTargets(normalized);

        setStatus({ type: "done", url: result.result.url });
      } catch (err) {
        setStatus({
          type: "error",
          message: err instanceof Error ? err.message : "Publish failed",
        });
      }
    },
    [adapter, profile, sets]
  );

  const handleSaveTarget = useCallback(
    async (newTarget: PublishTarget) => {
      const current = (await adapter.getDoc<PublishTarget[]>("publish-targets")) ?? [];
      const normalized = normalizeLegacyTargets(current);
      const idx = normalized.findIndex((t) => t.id === newTarget.id);
      if (idx >= 0) {
        normalized[idx] = newTarget;
      } else {
        normalized.push(newTarget);
      }
      await adapter.setDoc("publish-targets", normalized);
      setTargets(normalized);
      setConfigOpen(false);
    },
    [adapter]
  );

  if (!initialized) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {status.type === "done" && (
        <Link
          to={`/view?url=${encodeURIComponent(status.url)}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-sm hover:bg-accent transition-colors"
        >
          <Eye size={16} weight="bold" />
          View Published
        </Link>
      )}

      <div ref={buttonRef} className="relative">
        <button
          onClick={() => {
            if (status.type === "publishing") return;
            setMenuOpen((v) => !v);
          }}
          disabled={status.type === "publishing"}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <CloudArrowUp size={16} weight="bold" />
          {status.type === "publishing" ? status.message : "Publish"}
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 top-full mt-2 w-56 rounded-md border border-border bg-popover shadow-lg z-50"
          >
            <div className="py-1">
              {targets.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No publishers configured
                </div>
              )}
              {targets.map((target) => (
                <button
                  key={target.id}
                  onClick={() => handlePublishToTarget(target)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between"
                >
                  <span>{target.name || getDefaultTargetName(target)}</span>
                  {target.isRegistered && <Check size={14} weight="bold" className="text-muted-foreground" />}
                </button>
              ))}
              <div className="border-t border-border my-1" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setConfigOpen(true);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2"
              >
                <Plus size={14} weight="bold" />
                Configure new publisher
              </button>
            </div>
          </div>
        )}
      </div>

      {status.type === "error" && (
        <span className="text-sm text-destructive flex items-center gap-1">
          <Warning size={14} weight="bold" />
          {status.message}
        </span>
      )}

      {configOpen && (
        <PublisherConfigForm
          onSave={handleSaveTarget}
          onCancel={() => setConfigOpen(false)}
        />
      )}
    </div>
  );
}
