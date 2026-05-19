"use client";

import Link from "next/link";
import { Set } from "@/lib/types";
import { PhotoBlob } from "@/components/photo-blob";
import { Image as ImageIcon } from "@phosphor-icons/react";

export function SetCard({ set, viewHref, editHref }: { set: Set; viewHref?: string; editHref?: string }) {
  const firstPhotoId = set.sections.flatMap((s) => s.photos.map((p) => p.id))[0];
  const effectiveCoverId = set.coverPhotoId ?? firstPhotoId ?? null;
  const isEmpty = !effectiveCoverId;

  return (
    <Link
      href={editHref ?? viewHref ?? `/sets/${set.id}`}
      className="block shrink-0 max-w-[80vw] md:max-w-sm"
    >
      <div className="h-64 md:h-80 rounded-lg overflow-hidden flex items-center justify-center">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center w-40 h-full bg-muted text-muted-foreground">
            <ImageIcon size={32} weight="duotone" />
            <span className="text-sm mt-1">empty</span>
          </div>
        ) : (
          <PhotoBlob
            photoId={effectiveCoverId}
            className="inline-flex items-center justify-center h-64 md:h-80"
            imgClassName="h-full w-auto max-w-full object-contain block"
            alt={`Cover for ${set.title || "Untitled Set"}`}
          />
        )}
      </div>
      <p className="mt-2 text-sm font-medium truncate">{set.title || "Untitled Set"}</p>
    </Link>
  );
}
