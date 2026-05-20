import { notFound } from "next/navigation";
import { resolveUsername } from "@/lib/registry";
import { PublishedProfileProvider } from "@/lib/published-profile-provider";
import { Nav } from "@/components/nav";

export default async function PublishedUsernameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const baseUrl = resolveUsername(username);
  if (!baseUrl) {
    notFound();
  }

  return (
    <PublishedProfileProvider baseUrl={baseUrl}>
      <Nav />
      <main className="pt-14">{children}</main>
    </PublishedProfileProvider>
  );
}
