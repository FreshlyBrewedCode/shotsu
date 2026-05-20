export const REGISTRY: Record<string, string> = {
  demo: "https://demo.example.com/",
};

export function resolveUsername(username: string): string | null {
  return REGISTRY[username] ?? null;
}
