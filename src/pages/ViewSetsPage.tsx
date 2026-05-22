import { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { PublishedProfileProvider } from "@/lib/published-profile-provider";
import { useProfile } from "@/lib/profile-store";
import { SetCard } from "@/components/set-card";
import { Nav } from "@/components/nav";
import { Images } from "@phosphor-icons/react";

function getBaseUrl(url: string): string {
  const parsed = new URL(url);
  if (parsed.pathname.endsWith("profile.json")) {
    parsed.pathname = parsed.pathname.slice(0, -"profile.json".length);
  }
  return parsed.toString();
}

function ViewSetsPageInner() {
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
        <RemoteSetsGrid url={url} />
      </main>
    </PublishedProfileProvider>
  );
}

function RemoteSetsGrid({ url }: { url: string }) {
  const { state } = useProfile();
  const { profile, sets } = state;

  const setList = profile.sets
    .map((s) => sets[s.id])
    .filter(Boolean);

  return (
    <div className="w-full min-h-screen px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-heading mb-6">
        All Sets by {profile.name || "Untitled Profile"}
      </h1>

      {setList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Images size={48} weight="duotone" />
          <p className="mt-4 text-lg">No sets yet</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {setList.map((set) => (
            <SetCard
              key={set.id}
              set={set}
              viewHref={`/view/sets/${set.id}?url=${encodeURIComponent(url)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ViewSetsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ViewSetsPageInner />
    </Suspense>
  );
}
