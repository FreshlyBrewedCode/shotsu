import { useParams } from "react-router-dom";
import { resolveUsername } from "@/lib/registry";
import { PublishedProfileProvider } from "@/lib/published-profile-provider";
import { SetShell } from "@/components/set-shell";
import { Nav } from "@/components/nav";
import { EditProvider } from "@/lib/edit-context";

export function PublishedSetPage() {
  const params = useParams();
  const username = params.username as string;
  const id = params.id as string;
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
        <EditProvider setId={id}>
          <SetShell setId={id} isEditing={false} />
        </EditProvider>
      </main>
    </PublishedProfileProvider>
  );
}
