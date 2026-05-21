export class PublishedResolver {
  constructor(private baseUrl: string) {}

  resolve(photoId: string): Promise<string> {
    const url = new URL(`photos/${photoId}.webp`, this.baseUrl).toString();
    return Promise.resolve(url);
  }
}
