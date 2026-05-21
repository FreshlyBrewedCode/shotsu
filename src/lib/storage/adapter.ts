export interface StorageAdapter {
  initialize(): Promise<void>;

  // Documents
  getDoc<T>(key: string): Promise<T | null>;
  setDoc<T>(key: string, value: T): Promise<void>;
  deleteDoc(key: string): Promise<void>;

  // Blobs
  putBlob(key: string, blob: Blob): Promise<void>;
  getBlobURL(key: string): Promise<string>;
  deleteBlob(key: string): Promise<void>;
}
