"use client";

import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/profile-store";
import { ProfileShell } from "@/components/profile-shell";
import { createSet } from "@/lib/types";
import { Plus } from "@phosphor-icons/react";
import { PublishButton } from "@/components/publish-button";

export default function MePage() {
  const { dispatch } = useProfile();
  const router = useRouter();

  function handleCreateSet() {
    if (!dispatch) return;
    const newSet = createSet();
    dispatch({ type: "CREATE_SET", set: newSet });
    router.push(`/me/sets/${newSet.id}?mode=edit`);
  }

  return (
    <ProfileShell
      makeSetHref={(id) => `/me/sets/${id}`}
      actions={
        <>
          <PublishButton />
          <button
            onClick={handleCreateSet}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Plus size={18} weight="bold" />
            Create new set
          </button>
        </>
      }
    />
  );
}
