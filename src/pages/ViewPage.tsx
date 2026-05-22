import { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { PublishedProfileProvider } from "@/lib/published-profile-provider";
import { ProfileShell } from "@/components/profile-shell";
import { Nav } from "@/components/nav";

function getBaseUrl(url: string): string {
  const parsed = new URL(url);
  if (parsed.pathname.endsWith("profile.json")) {
    parsed.pathname = parsed.pathname.slice(0, -"profile.json".length);
  }
  return parsed.toString();
}

function ViewPageInner() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");

  if (!url) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Missing ?url= parameter</p>
      </div>
    );
  }

  const baseUrl = getBaseUrl(url);

  return (
    <PublishedProfileProvider baseUrl={baseUrl}>
      <Nav />
      <main className="pt-14">
        <ProfileShell
          makeSetHref={(id) =>
            `/view/sets/${id}?url=${encodeURIComponent(url)}`
          }
          setsListHref={`/view/sets?url=${encodeURIComponent(url)}`}
        />
      </main>
    </PublishedProfileProvider>
  );
}

export function ViewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ViewPageInner />
    </Suspense>
  );
}
