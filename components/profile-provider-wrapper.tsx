"use client";

import { ProfileProvider } from "@/lib/profile-store";
import { IndexedDBAdapter } from "@/lib/storage/indexeddb-adapter";
import { useMemo, useEffect } from "react";
import { Nav } from "@/components/nav";

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

  return (
    <ProfileProvider adapter={adapter}>
      <Nav />
      <main className="pt-14">{children}</main>
    </ProfileProvider>
  );
}
