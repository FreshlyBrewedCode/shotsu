"use client";

import { useLocalProfile } from "@/lib/profile-store";
import { createSection } from "@/lib/types";
import { Plus, Layout } from "@phosphor-icons/react";

export function EditToolbar({ setId }: { setId: string }) {
  const { dispatch } = useLocalProfile();

  function handleAddSection() {
    const section = createSection();
    dispatch({ type: "ADD_SECTION", setId, sectionId: section.id });
  }

  return (
    <aside className="fixed z-40 bg-background/90 backdrop-blur-sm border-border flex items-center gap-1 md:flex-col md:left-0 md:top-14 md:bottom-0 md:w-14 md:border-r md:px-2 md:py-4 bottom-0 left-0 right-0 h-14 border-t px-4 py-2">
      <ToolbarButton
        onClick={handleAddSection}
        icon={<Plus size={20} weight="bold" />}
        label="Add Section"
      />
      <div className="hidden md:block w-full h-px bg-border my-2" />
      <ToolbarButton
        onClick={() => {}}
        icon={<Layout size={20} weight="bold" />}
        label="Layouts (coming soon)"
        disabled
      />
    </aside>
  );
}

function ToolbarButton({
  onClick,
  icon,
  label,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {icon}
      </button>
      <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded bg-primary px-2 py-1 text-xs text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
        {label}
      </span>
    </div>
  );
}
