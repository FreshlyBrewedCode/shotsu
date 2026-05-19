"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PhotoResolver } from "@/lib/photo-resolver";
import { PublishedResolver } from "@/lib/published-resolver";
import { PublishedSource } from "@/lib/published-source";
import { ProfileHeader } from "@/components/profile-header";
import { ContentSection } from "@/components/content-section";
import { SetCard } from "@/components/set-card";
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

type ViewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      profile: Profile;
      sets: Record<string, SetType>;
      resolver: PublishedResolver;
    };

function ViewPageInner() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  const [state, setState] = useState<ViewState>(
    !url ? { status: "error", message: "Missing ?url= parameter" } : { status: "loading" }
  );

  useEffect(() => {
    if (!url) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const baseUrl = getBaseUrl(url);
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
        if (!cancelled) {
          setState({
            status: "ready",
            profile,
            sets,
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
  }, [url]);

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

  const { profile, sets, resolver } = state;
  const setList = profile.sets.map((s) => sets[s.id]).filter(Boolean);

  // Provide a minimal read-only ProfileContext so ProfileHeader can render
  const profileCtxValue: ProfileContextValue = {
    state: {
      profile,
      sets,
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
          <ProfileHeader />

          <ContentSection title="Sets">
            {setList.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full py-12 text-muted-foreground">
                <p className="text-sm">No sets yet.</p>
              </div>
            ) : (
              setList.map((set) => <SetCard key={set.id} set={set} />)
            )}
          </ContentSection>
        </div>
      </PhotoResolver.Provider>
    </ProfileContext.Provider>
  );
}

export default function ViewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ViewPageInner />
    </Suspense>
  );
}
