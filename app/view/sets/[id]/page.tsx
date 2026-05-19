"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PhotoResolver } from "@/lib/photo-resolver";
import { PublishedResolver } from "@/lib/published-resolver";
import { PublishedSource } from "@/lib/published-source";
import { SetViewer } from "@/components/set-viewer";
import { Profile, Set as SetType, CatalogEntry } from "@/lib/types";
import { ProfileContext, ProfileContextValue } from "@/lib/profile-store";

function getBaseUrl(url: string): string {
  const parsed = new URL(url);
  // If the URL points directly to profile.json, strip it
  if (parsed.pathname.endsWith("profile.json")) {
    parsed.pathname = parsed.pathname.slice(0, -"profile.json".length);
  }
  return parsed.toString();
}

type ViewSetState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      profile: Profile;
      set: SetType;
      resolver: PublishedResolver;
    };

function ViewSetPageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const id = params.id as string;

  const [state, setState] = useState<ViewSetState>(
    !url ? { status: "error", message: "Missing ?url= parameter" } : { status: "loading" }
  );

  useEffect(() => {
    if (!url) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const baseUrl = getBaseUrl(url!);
        const source = new PublishedSource(baseUrl);
        await source.load();
        const profile = source.getProfile();
        if (!profile) {
          if (!cancelled) {
            setState({ status: "error", message: "Invalid profile JSON" });
          }
          return;
        }
        const sets = source.getSets();
        const set = sets[id];
        if (!set) {
          if (!cancelled) {
            setState({ status: "error", message: "Set not found" });
          }
          return;
        }
        if (!cancelled) {
          setState({
            status: "ready",
            profile,
            set,
            resolver: new PublishedResolver(baseUrl),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Failed to load published profile",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [url, id]);

  if (state.status === "error") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const { profile, set, resolver } = state;

  // Provide a minimal read-only ProfileContext so child components can render
  const profileCtxValue: ProfileContextValue = {
    state: {
      profile,
      sets: { [set.id]: set },
      catalog: [] as CatalogEntry[],
      initialized: true,
    },
    dispatch: undefined as unknown as ProfileContextValue["dispatch"],
    adapter: undefined as unknown as ProfileContextValue["adapter"],
  };

  return (
    <ProfileContext.Provider value={profileCtxValue}>
      <PhotoResolver.Provider value={resolver}>
        <div className="w-full min-h-screen">
          <SetViewer set={set} />
        </div>
      </PhotoResolver.Provider>
    </ProfileContext.Provider>
  );
}

export default function ViewSetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ViewSetPageInner />
    </Suspense>
  );
}
