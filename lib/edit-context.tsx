"use client";

import { createContext, useContext, useRef, useCallback, useState } from "react";

type EditContextValue = {
  setId: string;
  activeSectionId: string | null;
  requestAddPhoto: (sectionId: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
};

const EditContext = createContext<EditContextValue | null>(null);

export function EditProvider({
  setId,
  children,
}: {
  setId: string;
  children: React.ReactNode;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const requestAddPhoto = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    fileInputRef.current?.click();
  }, []);

  return (
    <EditContext.Provider value={{ setId, activeSectionId, requestAddPhoto, fileInputRef }}>
      {children}
    </EditContext.Provider>
  );
}

export function useEdit() {
  const ctx = useContext(EditContext);
  if (!ctx) {
    throw new Error("useEdit must be used within EditProvider");
  }
  return ctx;
}
