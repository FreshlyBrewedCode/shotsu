"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/profile-store";
import { createSet } from "@/lib/types";
import { Plus } from "@phosphor-icons/react";

export function Nav() {
  const { dispatch } = useProfile();
  const router = useRouter();

  function handleCreateSet() {
    const newSet = createSet();
    dispatch({ type: "CREATE_SET", set: newSet });
    router.push(`/sets/${newSet.id}/edit`);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-transparent">
      <Link
        href="/"
        className="text-lg font-semibold tracking-tight"
        aria-label="Home"
      >
        shotsu
      </Link>
      <button
        onClick={handleCreateSet}
        aria-label="Create new set"
        className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent transition-colors"
      >
        <Plus size={20} weight="bold" />
      </button>
    </nav>
  );
}
