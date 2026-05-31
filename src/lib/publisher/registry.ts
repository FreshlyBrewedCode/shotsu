import { Publisher } from "./types";
import { ZipPublisher } from "./zip-publisher";
import { GitHubPagesPublisher } from "./github-pages-publisher";

type PublisherConstructor = new () => Publisher;

const registry: Record<string, PublisherConstructor> = {
  zip: ZipPublisher,
  "github-pages": GitHubPagesPublisher,
};

export function getPublisherIds(): string[] {
  return Object.keys(registry);
}

export function createPublisher(
  publisherId: string,
  config: Record<string, unknown>
): Promise<Publisher> {
  const Constructor = registry[publisherId];
  if (!Constructor) {
    throw new Error(`Unknown publisher: ${publisherId}`);
  }
  const publisher = new Constructor();
  return publisher.configure(config).then(() => publisher);
}
