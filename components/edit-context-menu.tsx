"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useProfile } from "@/lib/profile-store";
import { useEdit } from "@/lib/edit-context";

type ContextMenuTarget =
  | { type: "section"; sectionId: string }
  | { type: "photo"; sectionId: string; photoId: string };

export function useEditContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<ContextMenuTarget | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<number | null>(null);

  const open = useCallback(
    (newTarget: ContextMenuTarget, clientX: number, clientY: number) => {
      setTarget(newTarget);
      setPosition({ x: clientX, y: clientY });
      setIsOpen(true);
    },
    []
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setPosition(null);
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, newTarget: ContextMenuTarget) => {
      e.preventDefault();
      open(newTarget, e.clientX, e.clientY);
    },
    [open]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, newTarget: ContextMenuTarget) => {
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
      }
      const touch = e.touches[0];
      longPressTimer.current = window.setTimeout(() => {
        open(newTarget, touch.clientX, touch.clientY);
      }, 500);
    },
    [open]
  );

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  return {
    isOpen,
    target,
    position,
    open,
    close,
    handleContextMenu,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

export function EditContextMenuOverlay({
  isOpen,
  target,
  position,
  onClose,
  setId,
}: {
  isOpen: boolean;
  target: ContextMenuTarget | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  setId: string;
}) {
  const { state, dispatch } = useProfile();
  const { requestAddPhoto } = useEdit();
  const set = state.sets[setId];
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (overlayRef.current && e.target instanceof Node && !overlayRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !target || !set) return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const sectionActions: { label: string; action: () => void; disabled?: boolean }[] = [
    {
      label: "Add Photo",
      action: () => {
        requestAddPhoto(target.sectionId);
        onClose();
      },
    },
    {
      label: "Remove Section",
      action: () => {
        dispatch({ type: "REMOVE_SECTION", setId, sectionId: target.sectionId });
        onClose();
      },
      disabled: set.sections.length <= 1,
    },
    {
      label: "Move Section Up",
      action: () => {
        dispatch({ type: "MOVE_SECTION", setId, sectionId: target.sectionId, direction: "up" });
        onClose();
      },
    },
    {
      label: "Move Section Down",
      action: () => {
        dispatch({ type: "MOVE_SECTION", setId, sectionId: target.sectionId, direction: "down" });
        onClose();
      },
    },
    {
      label: "Layout: Default",
      action: () => {
        dispatch({
          type: "UPDATE_SECTION_LAYOUT",
          setId,
          sectionId: target.sectionId,
          layout: "default",
        });
        onClose();
      },
    },
    {
      label: "Layout: Columns",
      action: () => {
        dispatch({
          type: "UPDATE_SECTION_LAYOUT",
          setId,
          sectionId: target.sectionId,
          layout: "columns",
        });
        onClose();
      },
    },
  ];

  const photoActions: { label: string; action: () => void; disabled?: boolean }[] = [
    {
      label: "Remove Photo",
      action: () => {
        if (target.type === "photo") {
          dispatch({
            type: "REMOVE_PHOTO",
            setId,
            sectionId: target.sectionId,
            photoId: target.photoId,
          });
        }
        onClose();
      },
    },
  ];

  const actions = target.type === "section" ? sectionActions : photoActions;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/40 flex items-end" onClick={onClose}>
        <div
          ref={overlayRef}
          className="w-full bg-background rounded-t-xl border-t border-border p-4"
          style={{ animation: "slideUp 200ms ease-out" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
          <div className="flex flex-col gap-1">
            {actions.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                disabled={item.disabled}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      <div
        ref={overlayRef}
        className="absolute bg-background border border-border rounded-md shadow-lg p-1 min-w-[180px]"
        style={{
          left: position ? Math.min(position.x, window.innerWidth - 200) : 0,
          top: position ? Math.min(position.y, window.innerHeight - 250) : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5">
          {actions.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              disabled={item.disabled}
              className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
