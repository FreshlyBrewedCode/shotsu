import { describe, it, expect } from "vitest";
import { profileReducer, getDefaultState } from "./profile-store";
import { Profile, Set, Section, CatalogEntry } from "../types";

function makeProfile(overrides?: Partial<Profile>): Profile {
  return { id: "p-1", name: "", sets: [], ...overrides };
}

function makeSet(overrides?: Partial<Set>): Set {
  return {
    id: "s-1",
    title: "",
    sections: [{ id: "sec-1", layout: "default", photos: [] }],
    ...overrides,
  };
}

function makeState(overrides?: { profile?: Profile; sets?: Record<string, Set>; catalog?: CatalogEntry[]; initialized?: boolean }) {
  return {
    profile: makeProfile(),
    sets: {},
    catalog: [],
    initialized: false,
    ...overrides,
  };
}

describe("profileReducer", () => {
  it("INIT sets up state and marks initialized", () => {
    const profile = makeProfile({ sets: [{ id: "s-1", title: "T" }] });
    const set = makeSet();
    const catalog: CatalogEntry[] = [];

    const state = profileReducer(
      getDefaultState(),
      { type: "INIT", profile, sets: { "s-1": set }, catalog }
    );

    expect(state.initialized).toBe(true);
    expect(state.profile).toEqual(profile);
    expect(state.sets["s-1"]).toEqual(set);
  });

  it("CREATE_SET adds a new set to profile and state", () => {
    const before = makeState();
    const newSet = makeSet({ id: "s-new" });

    const after = profileReducer(before, { type: "CREATE_SET", set: newSet });

    expect(after.profile.sets).toHaveLength(1);
    expect(after.profile.sets[0]).toEqual({ id: "s-new", title: "" });
    expect(after.sets["s-new"]).toEqual(newSet);
  });

  it("UPDATE_SET_TITLE changes the set title and profile summary", () => {
    const set = makeSet({ id: "s-1", title: "Old" });
    const before = makeState({
      profile: makeProfile({ sets: [{ id: "s-1", title: "Old" }] }),
      sets: { "s-1": set },
    });

    const after = profileReducer(before, { type: "UPDATE_SET_TITLE", setId: "s-1", title: "New" });

    expect(after.sets["s-1"].title).toBe("New");
    expect(after.profile.sets[0].title).toBe("New");
  });

  it("UPDATE_SET_TITLE is a no-op for unknown set ids", () => {
    const before = makeState();
    const after = profileReducer(before, { type: "UPDATE_SET_TITLE", setId: "unknown", title: "X" });
    expect(after).toEqual(before);
  });

  it("ADD_SECTION appends a section to the set", () => {
    const set = makeSet({ id: "s-1", sections: [{ id: "sec-1", layout: "default", photos: [] }] });
    const before = makeState({ sets: { "s-1": set } });

    const after = profileReducer(before, { type: "ADD_SECTION", setId: "s-1", sectionId: "sec-2" });

    expect(after.sets["s-1"].sections).toHaveLength(2);
    expect(after.sets["s-1"].sections[1].id).toBe("sec-2");
    expect(after.sets["s-1"].sections[1].layout).toBe("default");
  });

  it("REMOVE_SECTION removes a section", () => {
    const sections: Section[] = [
      { id: "sec-1", layout: "default", photos: [] },
      { id: "sec-2", layout: "default", photos: [] },
    ];
    const set = makeSet({ id: "s-1", sections });
    const before = makeState({ sets: { "s-1": set } });

    const after = profileReducer(before, { type: "REMOVE_SECTION", setId: "s-1", sectionId: "sec-1" });

    expect(after.sets["s-1"].sections).toHaveLength(1);
    expect(after.sets["s-1"].sections[0].id).toBe("sec-2");
  });

  it("REMOVE_SECTION is a no-op when only one section remains", () => {
    const set = makeSet({ id: "s-1", sections: [{ id: "sec-1", layout: "default", photos: [] }] });
    const before = makeState({ sets: { "s-1": set } });

    const after = profileReducer(before, { type: "REMOVE_SECTION", setId: "s-1", sectionId: "sec-1" });

    expect(after.sets["s-1"].sections).toHaveLength(1);
  });

  it("MOVE_SECTION swaps a section upward", () => {
    const sections: Section[] = [
      { id: "sec-a", layout: "default", photos: [] },
      { id: "sec-b", layout: "default", photos: [] },
    ];
    const set = makeSet({ id: "s-1", sections });
    const before = makeState({ sets: { "s-1": set } });

    const after = profileReducer(before, { type: "MOVE_SECTION", setId: "s-1", sectionId: "sec-b", direction: "up" });

    expect(after.sets["s-1"].sections.map((s) => s.id)).toEqual(["sec-b", "sec-a"]);
  });

  it("MOVE_SECTION is a no-op at the top boundary", () => {
    const sections: Section[] = [
      { id: "sec-a", layout: "default", photos: [] },
      { id: "sec-b", layout: "default", photos: [] },
    ];
    const set = makeSet({ id: "s-1", sections });
    const before = makeState({ sets: { "s-1": set } });

    const after = profileReducer(before, { type: "MOVE_SECTION", setId: "s-1", sectionId: "sec-a", direction: "up" });

    expect(after.sets["s-1"].sections.map((s) => s.id)).toEqual(["sec-a", "sec-b"]);
  });

  it("MOVE_SECTION is a no-op at the bottom boundary", () => {
    const sections: Section[] = [
      { id: "sec-a", layout: "default", photos: [] },
      { id: "sec-b", layout: "default", photos: [] },
    ];
    const set = makeSet({ id: "s-1", sections });
    const before = makeState({ sets: { "s-1": set } });

    const after = profileReducer(before, { type: "MOVE_SECTION", setId: "s-1", sectionId: "sec-b", direction: "down" });

    expect(after.sets["s-1"].sections.map((s) => s.id)).toEqual(["sec-a", "sec-b"]);
  });

  it("UPDATE_SECTION_LAYOUT changes the layout", () => {
    const set = makeSet({
      id: "s-1",
      sections: [{ id: "sec-1", layout: "default", photos: [] }],
    });
    const before = makeState({ sets: { "s-1": set } });

    const after = profileReducer(before, {
      type: "UPDATE_SECTION_LAYOUT",
      setId: "s-1",
      sectionId: "sec-1",
      layout: "columns",
    });

    expect(after.sets["s-1"].sections[0].layout).toBe("columns");
  });

  it("ADD_PHOTO appends a photo ref to the correct section", () => {
    const set = makeSet({
      id: "s-1",
      sections: [
        { id: "sec-1", layout: "default", photos: [] },
        { id: "sec-2", layout: "default", photos: [] },
      ],
    });
    const before = makeState({ sets: { "s-1": set } });

    const after = profileReducer(before, { type: "ADD_PHOTO", setId: "s-1", sectionId: "sec-2", photoId: "ph-1" });

    expect(after.sets["s-1"].sections[0].photos).toHaveLength(0);
    expect(after.sets["s-1"].sections[1].photos).toHaveLength(1);
    expect(after.sets["s-1"].sections[1].photos[0]).toEqual({ id: "ph-1" });
  });

  it("REMOVE_PHOTO removes the photo ref from the section", () => {
    const set = makeSet({
      id: "s-1",
      sections: [{ id: "sec-1", layout: "default", photos: [{ id: "ph-1" }, { id: "ph-2" }] }],
    });
    const before = makeState({ sets: { "s-1": set } });

    const after = profileReducer(before, { type: "REMOVE_PHOTO", setId: "s-1", sectionId: "sec-1", photoId: "ph-1" });

    expect(after.sets["s-1"].sections[0].photos).toHaveLength(1);
    expect(after.sets["s-1"].sections[0].photos[0].id).toBe("ph-2");
  });

  it("actions on unknown set ids are no-ops", () => {
    const before = makeState();

    expect(profileReducer(before, { type: "ADD_SECTION", setId: "x", sectionId: "y" })).toEqual(before);
    expect(profileReducer(before, { type: "REMOVE_SECTION", setId: "x", sectionId: "y" })).toEqual(before);
    expect(profileReducer(before, { type: "MOVE_SECTION", setId: "x", sectionId: "y", direction: "up" })).toEqual(before);
    expect(profileReducer(before, { type: "UPDATE_SECTION_LAYOUT", setId: "x", sectionId: "y", layout: "columns" })).toEqual(before);
    expect(profileReducer(before, { type: "ADD_PHOTO", setId: "x", sectionId: "y", photoId: "z" })).toEqual(before);
    expect(profileReducer(before, { type: "REMOVE_PHOTO", setId: "x", sectionId: "y", photoId: "z" })).toEqual(before);
  });
});
