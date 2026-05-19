"use client";

import { ProfileProvider } from "@/lib/profile-store";
import { IndexedDBAdapter } from "@/lib/storage/indexeddb-adapter";
import { LocalResolver } from "@/lib/photo-resolver";
import { useMemo, useEffect } from "react";
import { Nav } from "@/components/nav";

declare global {
  interface Window {
    __testAdapter?: IndexedDBAdapter;
    __testResolver?: LocalResolver;
  }
}

export function ProfileProviderWrapper({ children }: { children: React.ReactNode }) {
  const adapter = useMemo(() => new IndexedDBAdapter(), []);
  const resolver = useMemo(() => new LocalResolver(adapter), [adapter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__testAdapter = adapter;
      window.__testResolver = resolver;
    }
  }, [adapter, resolver]);

  return (
    <ProfileProvider adapter={adapter}>
      <Nav />
      <main className="pt-14">{children}</main>
    </ProfileProvider>
  );
}
