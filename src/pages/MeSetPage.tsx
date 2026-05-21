import { Suspense } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { SetShell } from "@/components/set-shell";
import { EditProvider } from "@/lib/edit-context";

function MeSetPageInner() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const id = params.id as string;
  const isEditing = searchParams.get("mode") === "edit";

  return (
    <EditProvider setId={id}>
      <SetShell setId={id} isEditing={isEditing} />
    </EditProvider>
  );
}

export function MeSetPage() {
  return (
    <Suspense>
      <MeSetPageInner />
    </Suspense>
  );
}
