import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "@/lib/profile-store";
import { createSet } from "@/lib/types";
import { Plus, User } from "@phosphor-icons/react";

export function Nav() {
  const { dispatch } = useProfile();
  const navigate = useNavigate();

  function handleCreateSet() {
    if (!dispatch) return;
    const newSet = createSet();
    dispatch({ type: "CREATE_SET", set: newSet });
    navigate(`/me/sets/${newSet.id}?mode=edit`);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-transparent">
      <Link
        to="/"
        className="text-lg font-semibold tracking-tight"
        aria-label="Home"
      >
        shotsu
      </Link>
      <div className="flex items-center gap-1">
        <Link
          to="/me"
          aria-label="Profile"
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent transition-colors"
        >
          <User size={20} weight="bold" />
        </Link>
        {dispatch && (
          <button
            onClick={handleCreateSet}
            aria-label="Create new set"
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent transition-colors"
          >
            <Plus size={20} weight="bold" />
          </button>
        )}
      </div>
    </nav>
  );
}
