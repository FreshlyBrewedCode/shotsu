"use client";

import React from "react";
import { Set } from "@/lib/types";
import { Section } from "@/components/section";
import { PhotoBlob } from "@/components/photo-blob";

export function SetViewer({
  set,
  title,
  onContextMenuSection,
  onContextMenuPhoto,
  onTouchStartSection,
  onTouchStartPhoto,
  onTouchMove,
  onTouchEnd,
}: {
  set: Set;
  title?: React.ReactNode;
  onContextMenuSection?: (sectionId: string, e: React.MouseEvent) => void;
  onContextMenuPhoto?: (sectionId: string, photoId: string, e: React.MouseEvent) => void;
  onTouchStartSection?: (sectionId: string, e: React.TouchEvent) => void;
  onTouchStartPhoto?: (sectionId: string, photoId: string, e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}) {
  return (
    <div className="w-full min-h-[calc(100dvh-3.5rem)] flex flex-col md:pl-16 pb-16 md:pb-0">
      <div className="px-4 py-6">
        {title ?? (
          <h1 className="w-full text-3xl font-heading pb-2">
            {set.title || "Untitled Set"}
          </h1>
        )}
      </div>
      <div className="flex flex-col">
        {set.sections.map((section, index) => (
          <div key={section.id} className="flex flex-col">
            {index > 0 && (
              <div className="w-full h-px bg-border my-2" aria-hidden="true" />
            )}
            <div
              className={`p-1 -m-1 ${
                onContextMenuSection
                  ? "border border-transparent hover:border-dashed hover:border-muted-foreground/30 rounded-sm transition-colors"
                  : ""
              }`}
              onContextMenu={
                onContextMenuSection
                  ? (e) => onContextMenuSection(section.id, e)
                  : undefined
              }
              onTouchStart={
                onTouchStartSection
                  ? (e) => onTouchStartSection(section.id, e)
                  : undefined
              }
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <Section layout={section.layout}>
                {section.photos.length === 0 && (
                  <div className="text-muted-foreground text-sm py-8 text-center">
                    Empty section
                  </div>
                )}
                {section.photos.map((photo) => (
                  <div
                    key={photo.id}
                    onContextMenu={
                      onContextMenuPhoto
                        ? (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onContextMenuPhoto(section.id, photo.id, e);
                          }
                        : undefined
                    }
                    onTouchStart={
                      onTouchStartPhoto
                        ? (e) => onTouchStartPhoto(section.id, photo.id, e)
                        : undefined
                    }
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    <PhotoBlob photoId={photo.id} />
                  </div>
                ))}
              </Section>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
