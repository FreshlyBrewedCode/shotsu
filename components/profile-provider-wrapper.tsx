"use client";

import { ProfileProvider } from "@/lib/profile-store";
import { IndexedDBAdapter } from "@/lib/storage/indexeddb-adapter";
import { useMemo, useEffect } from "react";

declare global {
  interface Window {
    __testAdapter?: IndexedDBAdapter;
  }
}

export function ProfileProviderWrapper({ children }: { children: React.ReactNode }) {
  const adapter = useMemo(() => new IndexedDBAdapter(), []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__testAdapter = adapter;
    }
  }, [adapter]);

  return <ProfileProvider adapter={adapter}>{children}</ProfileProvider>;
}
