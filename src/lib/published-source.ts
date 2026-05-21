import { Profile, Set } from "./types";

export class PublishedSource {
  private profile: Profile | null = null;
  private sets: Record<string, Set> = {};
  private loaded = false;

  constructor(private baseUrl: string) {}

  async load(): Promise<void> {
    const profileUrl = new URL("profile.json", this.baseUrl).toString();
    const profileResponse = await fetch(profileUrl);
    if (!profileResponse.ok) {
      throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
    }
    this.profile = (await profileResponse.json()) as Profile;

    this.sets = {};
    for (const summary of this.profile.sets) {
      const setUrl = new URL(`sets/${summary.id}.json`, this.baseUrl).toString();
      const setResponse = await fetch(setUrl);
      if (!setResponse.ok) {
        throw new Error(`Failed to fetch set ${summary.id}: ${setResponse.status}`);
      }
      this.sets[summary.id] = (await setResponse.json()) as Set;
    }

    this.loaded = true;
  }

  getProfile(): Profile | null {
    return this.profile;
  }

  getSets(): Record<string, Set> {
    return this.sets;
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}
