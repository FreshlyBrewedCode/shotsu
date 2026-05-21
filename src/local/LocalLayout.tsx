import { ProfileProvider } from "@/lib/profile-store";
import { IndexedDBAdapter } from "@/lib/storage/indexeddb-adapter";
import { LocalResolver } from "@/lib/photo-resolver";
import { Nav } from "@/components/nav";
import { useMemo, useEffect } from "react";
import { Outlet } from "react-router-dom";

declare global {
  interface Window {
    __testAdapter?: IndexedDBAdapter;
    __testResolver?: LocalResolver;
  }
}

export function LocalLayout() {
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
      <main className="pt-14">
        <Outlet />
      </main>
    </ProfileProvider>
  );
}
