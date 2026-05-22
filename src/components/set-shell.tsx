import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProfile } from "@/lib/profile-store";
import { SetViewer } from "@/components/set-viewer";
import { EditToolbar } from "@/components/edit-toolbar";
import { useEdit } from "@/lib/edit-context";
import { ingestPhoto } from "@/lib/ingest";
import {
  useEditContextMenu,
  EditContextMenuOverlay,
} from "@/components/edit-context-menu";
import { Pencil, Check } from "@phosphor-icons/react";

export function SetShell({
  setId,
  isEditing,
}: {
  setId: string;
  isEditing: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, dispatch, adapter } = useProfile();
  const set = state.sets[setId];
  const { activeSectionId, fileInputRef } = useEdit();
  const ctxMenu = useEditContextMenu();

  if (!state.initialized || !set) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const canEdit = dispatch !== undefined && adapter !== undefined;
  const editing = isEditing && canEdit;

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!dispatch || !adapter) return;
      const files = e.target.files;
      if (!files || files.length === 0) return;
      if (!activeSectionId) return;

      for (const file of Array.from(files)) {
        try {
          const photoId = await ingestPhoto(
            file,
            { setId, sectionId: activeSectionId },
            adapter
          );
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

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!dispatch) return;
    dispatch({ type: "UPDATE_SET_TITLE", setId, title: e.target.value });
  }

  return (
    <div className="relative">
      <SetViewer
        set={set}
        title={
          editing ? (
            <input
              type="text"
              value={set.title}
              onChange={handleTitleChange}
              placeholder="Untitled Set"
              className="w-full text-3xl font-heading bg-transparent border-b border-border focus:outline-none focus:border-primary pb-2"
              aria-label="Set title"
            />
          ) : undefined
        }
        onContextMenuSection={
          editing
            ? (_sectionId, e) =>
                ctxMenu.handleContextMenu(e, {
                  type: "section",
                  sectionId: _sectionId,
                })
            : undefined
        }
        onTouchStartSection={
          editing
            ? (_sectionId, e) =>
                ctxMenu.handleTouchStart(e, {
                  type: "section",
                  sectionId: _sectionId,
                })
            : undefined
        }
        onTouchMove={editing ? ctxMenu.handleTouchMove : undefined}
        onTouchEnd={editing ? ctxMenu.handleTouchEnd : undefined}
        onContextMenuPhoto={
          editing
            ? (_sectionId, photoId, e) => {
                ctxMenu.open(
                  { type: "photo", sectionId: _sectionId, photoId },
                  e.clientX,
                  e.clientY
                );
              }
            : undefined
        }
        onTouchStartPhoto={
          editing
            ? (_sectionId, photoId, e) =>
                ctxMenu.handleTouchStart(e, {
                  type: "photo",
                  sectionId: _sectionId,
                  photoId,
                })
            : undefined
        }
      />

      {editing && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            aria-hidden="true"
          />
          <EditToolbar setId={setId} />
          <EditContextMenuOverlay
            isOpen={ctxMenu.isOpen}
            target={ctxMenu.target}
            position={ctxMenu.position}
            onClose={ctxMenu.close}
            setId={setId}
          />
        </>
      )}

      {canEdit && !editing && (
        <Link
          to="?mode=edit"
          replace
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Edit set"
        >
          <Pencil size={18} weight="bold" />
          <span className="text-sm font-medium">Edit</span>
        </Link>
      )}

      {editing && (
        <button
          onClick={() => {
            const next = new URLSearchParams(searchParams);
            next.delete("mode");
            setSearchParams(next, { replace: true });
          }}
          className="fixed bottom-20 right-6 md:bottom-6 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Done editing"
        >
          <Check size={18} weight="bold" />
          <span className="text-sm font-medium">Done</span>
        </button>
      )}
    </div>
  );
}
