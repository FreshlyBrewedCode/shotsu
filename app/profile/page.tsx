"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProfile } from "@/lib/profile-store";
import { ProfileHeader } from "@/components/profile-header";
import { ContentSection } from "@/components/content-section";
import { SetCard } from "@/components/set-card";
import { createSet } from "@/lib/types";
import { Plus } from "@phosphor-icons/react";
import { PublishButton } from "@/components/publish-button";

export default function ProfilePage() {
  const { state, dispatch } = useProfile();
  const router = useRouter();
  const { profile, sets } = state;

  const setList = profile.sets
    .map((s) => sets[s.id])
    .filter(Boolean);

  const previewSets = setList.slice(0, 5);

  function handleCreateSet() {
    const newSet = createSet();
    dispatch({ type: "CREATE_SET", set: newSet });
    router.push(`/sets/${newSet.id}/edit`);
  }

  return (
    <div className="w-full min-h-screen">
      <ProfileHeader />

      <div className="px-4 pb-6 max-w-6xl mx-auto flex justify-end gap-2">
        <PublishButton />
        <button
          onClick={handleCreateSet}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
        >
          <Plus size={18} weight="bold" />
          Create new set
        </button>
      </div>

      <ContentSection
        title="Your Sets"
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
            <button
              onClick={handleCreateSet}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Create your first set
            </button>
          </div>
        ) : (
          previewSets.map((set) => <SetCard key={set.id} set={set} />)
        )}
      </ContentSection>
    </div>
  );
}
