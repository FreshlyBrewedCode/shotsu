"use client";

import { useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProfile } from "@/lib/profile-store";
import { Section as SectionComponent } from "@/components/section";
import { PhotoBlob } from "@/components/photo-blob";
import { EditToolbar } from "@/components/edit-toolbar";
import { EditProvider, useEdit } from "@/lib/edit-context";
import { ingestPhoto } from "@/lib/ingest";
import {
  useEditContextMenu,
  EditContextMenuOverlay,
} from "@/components/edit-context-menu";

function SetEditPageInner() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch, adapter } = useProfile();
  const { setId, activeSectionId, fileInputRef } = useEdit();
  const ctxMenu = useEditContextMenu();

  const id = params.id as string;
  const set = state.sets[id];

  useEffect(() => {
    if (state.initialized && !set) {
      router.replace("/");
    }
  }, [state.initialized, set, router]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      if (!activeSectionId) return;

      for (const file of Array.from(files)) {
        try {
          const photoId = await ingestPhoto(file, { setId, sectionId: activeSectionId }, adapter);
          dispatch({
            type: "ADD_PHOTO",
            setId,
            sectionId: activeSectionId,
            photoId,
          });
        } catch (err) {
          console.error("Failed to ingest photo:", err);
        }
      }

      e.target.value = "";
    },
    [activeSectionId, adapter, dispatch, setId]
  );

  if (!state.initialized || !set) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    dispatch({ type: "UPDATE_SET_TITLE", setId: id, title: e.target.value });
  }

  return (
    <div className="w-screen min-h-screen max-w-screen flex flex-col md:pl-16 pb-16 md:pb-0">
      <div className="px-4 py-6">
        <input
          type="text"
          value={set.title}
          onChange={handleTitleChange}
          placeholder="Untitled Set"
          className="w-full text-3xl font-heading bg-transparent border-b border-border focus:outline-none focus:border-primary pb-2"
          aria-label="Set title"
        />
      </div>
      <div className="flex flex-col">
        {set.sections.map((section, index) => (
          <div key={section.id} className="flex flex-col">
            {index > 0 && (
              <div className="w-full h-px bg-border my-2" aria-hidden="true" />
            )}
            <div
              className="border border-transparent hover:border-dashed hover:border-muted-foreground/30 rounded-sm transition-colors p-1 -m-1"
              onContextMenu={(e) =>
                ctxMenu.handleContextMenu(e, { type: "section", sectionId: section.id })
              }
              onTouchStart={(e) =>
                ctxMenu.handleTouchStart(e, { type: "section", sectionId: section.id })
              }
              onTouchMove={ctxMenu.handleTouchMove}
              onTouchEnd={ctxMenu.handleTouchEnd}
            >
              <SectionComponent layout={section.layout}>
                {section.photos.length === 0 && (
                  <div className="text-muted-foreground text-sm py-8 text-center">
                    Empty section
                  </div>
                )}
                {section.photos.map((photo) => (
                  <div
                    key={photo.id}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      ctxMenu.open(
                        { type: "photo", sectionId: section.id, photoId: photo.id },
                        e.clientX,
                        e.clientY
                      );
                    }}
                    onTouchStart={(e) =>
                      ctxMenu.handleTouchStart(e, {
                        type: "photo",
                        sectionId: section.id,
                        photoId: photo.id,
                      })
                    }
                    onTouchMove={ctxMenu.handleTouchMove}
                    onTouchEnd={ctxMenu.handleTouchEnd}
                  >
                    <PhotoBlob photoId={photo.id} />
                  </div>
                ))}
              </SectionComponent>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      <EditToolbar setId={id} />

      <EditContextMenuOverlay
        isOpen={ctxMenu.isOpen}
        target={ctxMenu.target}
        position={ctxMenu.position}
        onClose={ctxMenu.close}
        setId={id}
      />
    </div>
  );
}

export default function SetEditPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <EditProvider setId={id}>
      <SetEditPageInner />
    </EditProvider>
  );
}
