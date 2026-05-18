"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/lib/profile-store";

export function PhotoBlob({ photoId, className, imgClassName, alt }: { photoId: string; className?: string; imgClassName?: string; alt?: string }) {
  const { adapter } = useProfile();
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function load() {
      try {
        objectUrl = await adapter.getBlobURL(`photo:${photoId}`);
        if (!cancelled) {
          setSrc(objectUrl);
        } else if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      } catch {
        if (!cancelled) {
          setSrc(null);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [photoId, adapter]);

  if (!src) {
    return (
      <div className={className ?? "flex items-center justify-center w-full h-40 bg-muted"}>
        <span className="text-muted-foreground text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <div className={className ?? "flex max-w-screen md:max-w-[1000px] max-h-screen md:max-h-[70vh] m-2 my-[10vh]"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || "Photo"}
        className={imgClassName ?? "object-contain max-w-full max-h-full"}
      />
    </div>
  );
}
