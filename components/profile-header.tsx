"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useProfile } from "@/lib/profile-store";
import { PhotoBlob } from "@/components/photo-blob";
import { User, X } from "@phosphor-icons/react";

export function ProfileHeader() {
  const { state, dispatch } = useProfile();
  const { profile } = state;

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [bioValue, setBioValue] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const bioInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingBio && bioInputRef.current) {
      bioInputRef.current.focus();
    }
  }, [isEditingBio]);

  const startEditingName = useCallback(() => {
    setNameValue(profile.name);
    setIsEditingName(true);
  }, [profile.name]);

  const startEditingBio = useCallback(() => {
    setBioValue(profile.bio);
    setIsEditingBio(true);
  }, [profile.bio]);

  const saveName = useCallback(() => {
    dispatch({ type: "UPDATE_PROFILE_NAME", name: nameValue });
    setIsEditingName(false);
  }, [dispatch, nameValue]);

  const saveBio = useCallback(() => {
    dispatch({ type: "UPDATE_PROFILE_BIO", bio: bioValue });
    setIsEditingBio(false);
  }, [dispatch, bioValue]);

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        saveName();
      } else if (e.key === "Escape") {
        setIsEditingName(false);
      }
    },
    [saveName]
  );

  const handleBioKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        saveBio();
      } else if (e.key === "Escape") {
        setIsEditingBio(false);
      }
    },
    [saveBio]
  );

  const handleAvatarSelect = useCallback(
    (photoId: string) => {
      dispatch({ type: "UPDATE_PROFILE_AVATAR", photoId });
      setShowAvatarPicker(false);
    },
    [dispatch]
  );

  const handleRemoveAvatar = useCallback(() => {
    dispatch({ type: "UPDATE_PROFILE_AVATAR", photoId: null });
    setShowAvatarPicker(false);
  }, [dispatch]);

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-8">
        {/* Avatar */}
        <button
          onClick={() => setShowAvatarPicker(true)}
          className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-primary transition-all"
          aria-label="Change avatar"
        >
          {profile.avatarPhotoId ? (
            <PhotoBlob
              photoId={profile.avatarPhotoId}
              className="w-full h-full"
            />
          ) : (
            <User size={48} weight="duotone" className="text-muted-foreground" />
          )}
        </button>

        {/* Name + Bio */}
        <div className="flex flex-col items-center md:items-start gap-2 flex-1 min-w-0 text-center md:text-left">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={saveName}
              onKeyDown={handleNameKeyDown}
              className="text-2xl font-heading bg-transparent border-b border-border focus:outline-none focus:border-primary w-full max-w-md text-center md:text-left"
              aria-label="Profile name"
            />
          ) : (
            <h1
              onClick={startEditingName}
              className="text-2xl font-heading cursor-pointer hover:opacity-80 transition-opacity"
            >
              {profile.name || "Untitled Profile"}
            </h1>
          )}

          {isEditingBio ? (
            <textarea
              ref={bioInputRef}
              value={bioValue}
              onChange={(e) => setBioValue(e.target.value)}
              onBlur={saveBio}
              onKeyDown={handleBioKeyDown}
              rows={3}
              className="text-sm bg-transparent border-b border-border focus:outline-none focus:border-primary w-full max-w-md resize-none text-center md:text-left"
              aria-label="Profile bio"
            />
          ) : (
            <p
              onClick={startEditingBio}
              className={`text-sm cursor-pointer hover:opacity-80 transition-opacity ${
                profile.bio ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {profile.bio || "Add a bio…"}
            </p>
          )}
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAvatarPicker(false)}
        >
          <div
            className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold">Choose avatar</h3>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="p-1 rounded-md hover:bg-accent transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {state.catalog.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No photos in catalog. Add photos to a set first.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {state.catalog.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleAvatarSelect(entry.id)}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
                      aria-label={`Select photo ${entry.filename}`}
                    >
                      <PhotoBlob
                        photoId={entry.id}
                        className="w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
              {profile.avatarPhotoId && (
                <button
                  onClick={handleRemoveAvatar}
                  className="mt-4 w-full py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  Remove avatar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
