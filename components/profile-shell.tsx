"use client";

import Link from "next/link";
import { useProfile } from "@/lib/profile-store";
import { ProfileHeader } from "@/components/profile-header";
import { ContentSection } from "@/components/content-section";
import { SetCard } from "@/components/set-card";
import { ReactNode } from "react";

export function ProfileShell({
  makeSetHref,
  actions,
}: {
  makeSetHref: (id: string) => string;
  actions?: ReactNode;
}) {
  const { state } = useProfile();
  const { profile, sets } = state;

  const setList = profile.sets
    .map((s) => sets[s.id])
    .filter(Boolean);

  const previewSets = setList.slice(0, 5);

  return (
    <div className="w-full min-h-screen">
      <ProfileHeader />

      {actions && (
        <div className="px-4 pb-6 max-w-6xl mx-auto flex justify-end gap-2">
          {actions}
        </div>
      )}

      <ContentSection
        title="Sets"
        action={
          <Link
            href="/sets"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Show all
          </Link>
        }
      >
        {previewSets.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-12 text-muted-foreground">
            <p className="text-sm">No sets yet.</p>
          </div>
        ) : (
          previewSets.map((set) => (
            <SetCard key={set.id} set={set} viewHref={makeSetHref(set.id)} />
          ))
        )}
      </ContentSection>
    </div>
  );
}
