import { Suspense } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PublishedProfileProvider } from "@/lib/published-profile-provider";
import { SetShell } from "@/components/set-shell";
import { Nav } from "@/components/nav";

function getBaseUrl(url: string): string {
  const parsed = new URL(url);
  if (parsed.pathname.endsWith("profile.json")) {
    parsed.pathname = parsed.pathname.slice(0, -"profile.json".length);
  }
  return parsed.toString();
}

function ViewSetPageInner() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const id = params.id as string;

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
        <SetShell setId={id} isEditing={false} />
      </main>
    </PublishedProfileProvider>
  );
}

export function ViewSetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ViewSetPageInner />
    </Suspense>
  );
}
