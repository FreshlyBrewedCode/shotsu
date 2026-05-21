import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "@/lib/profile-store";
import { SetViewer } from "@/components/set-viewer";
import { EditToolbar } from "@/components/edit-toolbar";
import { useEdit } from "@/lib/edit-context";
import { ingestPhoto } from "@/lib/ingest";
import {
  useEditContextMenu,
  EditContextMenuOverlay,
} from "@/components/edit-context-menu";
import { Pencil } from "@phosphor-icons/react";
import type { Set } from "@/lib/types";
import type { StorageAdapter } from "@/lib/storage/adapter";
import type { ProfileAction } from "@/lib/profile-store";

function SetEditChrome({
  setId,
  set,
  dispatch,
  adapter,
}: {
  setId: string;
  set: Set;
  dispatch: React.Dispatch<ProfileAction>;
  adapter: StorageAdapter;
}) {
  const { activeSectionId, fileInputRef } = useEdit();
  const ctxMenu = useEditContextMenu();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    dispatch({ type: "UPDATE_SET_TITLE", setId, title: e.target.value });
  }

  return (
    <>
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
          ctxMenu.handleContextMenu(e, {
            type: "section",
            sectionId: _sectionId,
          })
        }
        onTouchStartSection={(_sectionId, e) =>
          ctxMenu.handleTouchStart(e, {
            type: "section",
            sectionId: _sectionId,
          })
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

      <EditToolbar setId={setId} />

      <EditContextMenuOverlay
        isOpen={ctxMenu.isOpen}
        target={ctxMenu.target}
        position={ctxMenu.position}
        onClose={ctxMenu.close}
        setId={setId}
      />
    </>
  );
}

export function SetShell({
  setId,
  isEditing,
}: {
  setId: string;
  isEditing: boolean;
}) {
  const { state, dispatch, adapter } = useProfile();
  const set = state.sets[setId];

  if (!state.initialized || !set) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const canEdit = dispatch !== undefined && adapter !== undefined;

  if (isEditing && canEdit) {
    return (
      <div className="relative">
        <SetEditChrome
          setId={setId}
          set={set}
          dispatch={dispatch}
          adapter={adapter}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <SetViewer set={set} />
      {canEdit && (
        <Link
          to="?mode=edit"
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Edit set"
        >
          <Pencil size={18} weight="bold" />
          <span className="text-sm font-medium">Edit</span>
        </Link>
      )}
    </div>
  );
}
