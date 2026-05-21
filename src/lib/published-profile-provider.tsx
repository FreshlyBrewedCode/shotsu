"use client";

import { useEffect, useState, ReactNode, useMemo } from "react";
import { PublishedSource } from "@/lib/published-source";
import { PublishedResolver } from "@/lib/published-resolver";
import { Profile, Set as SetType, CatalogEntry } from "@/lib/types";
import { ProfileContext, ProfileContextValue } from "@/lib/profile-store";
import { PhotoResolver } from "@/lib/photo-resolver";

function getBaseUrl(url: string): string {
  const parsed = new URL(url);
  // If the URL points directly to profile.json, strip it
  if (parsed.pathname.endsWith("profile.json")) {
    parsed.pathname = parsed.pathname.slice(0, -"profile.json".length);
  }
  return parsed.toString();
}

type PublishedProfileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      profile: Profile;
      sets: Record<string, SetType>;
      resolver: PublishedResolver;
    };

export function PublishedProfileProvider({
  baseUrl,
  children,
}: {
  baseUrl: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<PublishedProfileState>({
    status: "loading",
  });

  const normalizedBaseUrl = useMemo(() => getBaseUrl(baseUrl), [baseUrl]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const source = new PublishedSource(normalizedBaseUrl);
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
            resolver: new PublishedResolver(normalizedBaseUrl),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              err instanceof Error
                ? err.message
                : "Failed to load published profile",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [normalizedBaseUrl]);

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

  const profileCtxValue: ProfileContextValue = {
    state: {
      profile,
      sets,
      catalog: [] as CatalogEntry[],
      initialized: true,
    },
    dispatch: undefined,
    adapter: undefined,
  };

  return (
    <ProfileContext.Provider value={profileCtxValue}>
      <PhotoResolver.Provider value={resolver}>
        {children}
      </PhotoResolver.Provider>
    </ProfileContext.Provider>
  );
}
