"use client";

import { useProfile } from "@/lib/profile-store";
import { SetCard } from "@/components/set-card";
import { Images } from "@phosphor-icons/react";

export default function SetsPage() {
  const { state } = useProfile();
  const { profile, sets } = state;

  const setList = profile.sets
    .map((s) => sets[s.id])
    .filter(Boolean);

  return (
    <div className="w-full min-h-screen px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-heading mb-6">All Sets</h1>

      {setList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Images size={48} weight="duotone" />
          <p className="mt-4 text-lg">No sets yet</p>
          <p className="text-sm mt-1">
            Create a set from your profile page to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {setList.map((set) => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      )}
    </div>
  );
}
