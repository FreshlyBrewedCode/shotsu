import { useParams } from "react-router-dom";
import { resolveUsername } from "@/lib/registry";
import { PublishedProfileProvider } from "@/lib/published-profile-provider";
import { ProfileShell } from "@/components/profile-shell";
import { Nav } from "@/components/nav";

export function PublishedProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const baseUrl = resolveUsername(username);

  if (!baseUrl) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <PublishedProfileProvider baseUrl={baseUrl}>
      <Nav />
      <main className="pt-14">
        <ProfileShell makeSetHref={(id) => `/p/${username}/sets/${id}`} />
      </main>
    </PublishedProfileProvider>
  );
}
