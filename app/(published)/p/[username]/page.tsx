import { ProfileShell } from "@/components/profile-shell";

export default async function PublishedUsernamePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return (
    <ProfileShell makeSetHref={(id) => `/p/${username}/sets/${id}`} />
  );
}
