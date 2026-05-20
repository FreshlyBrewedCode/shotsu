import { SetShell } from "@/components/set-shell";

export default async function PublishedUsernameSetPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { id } = await params;
  return <SetShell setId={id} isEditing={false} />;
}
