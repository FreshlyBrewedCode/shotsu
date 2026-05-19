"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProfile } from "@/lib/profile-store";
import { SetViewer } from "@/components/set-viewer";
import Link from "next/link";
import { Pencil } from "@phosphor-icons/react";

export default function SetPage() {
  const params = useParams();
  const router = useRouter();
  const { state } = useProfile();

  const id = params.id as string;
  const set = state.sets[id];

  useEffect(() => {
    if (state.initialized && !set) {
      router.replace("/");
    }
  }, [state.initialized, set, router]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!state.initialized || !set) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <SetViewer set={set} />
      <Link
        href={`/sets/${id}/edit`}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Edit set"
      >
        <Pencil size={18} weight="bold" />
        <span className="text-sm font-medium">Edit</span>
      </Link>
    </div>
  );
}
