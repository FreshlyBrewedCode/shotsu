"use client";

import { useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProfile } from "@/lib/profile-store";
import { SetViewer } from "@/components/set-viewer";
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="relative">
      <SetViewer
        set={set}
        title={
          <input
            type="text"
            value={set.title}
            onChange={handleTitleChange}
            placeholder="Untitled Set"
            className="w-full text-3xl font-heading bg-transparent border-b border-border focus:outline-none focus:border-primary pb-2"
            aria-label="Set title"
          />
        }
        onContextMenuSection={(_sectionId, e) =>
          ctxMenu.handleContextMenu(e, { type: "section", sectionId: _sectionId })
        }
        onTouchStartSection={(_sectionId, e) =>
          ctxMenu.handleTouchStart(e, { type: "section", sectionId: _sectionId })
        }
        onTouchMove={ctxMenu.handleTouchMove}
        onTouchEnd={ctxMenu.handleTouchEnd}
        onContextMenuPhoto={(_sectionId, photoId, e) => {
          ctxMenu.open(
            { type: "photo", sectionId: _sectionId, photoId },
            e.clientX,
            e.clientY
          );
        }}
        onTouchStartPhoto={(_sectionId, photoId, e) =>
          ctxMenu.handleTouchStart(e, {
            type: "photo",
            sectionId: _sectionId,
            photoId,
          })
        }
      />

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
