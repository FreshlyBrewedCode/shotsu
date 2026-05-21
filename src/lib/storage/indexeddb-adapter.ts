import { openDB, DBSchema, IDBPDatabase } from "idb";
import { StorageAdapter } from "./adapter";

const DB_NAME = "shotsu-store";
const DB_VERSION = 1;

interface ShotsuDB extends DBSchema {
  documents: {
    key: string;
    value: unknown;
  };
  blobs: {
    key: string;
    value: Blob;
  };
}

export class IndexedDBAdapter implements StorageAdapter {
  private db: IDBPDatabase<ShotsuDB> | null = null;
  private dbName: string;

  constructor(options?: { dbName?: string }) {
    this.dbName = options?.dbName ?? DB_NAME;
  }

  async initialize(): Promise<void> {
    this.db = await openDB<ShotsuDB>(this.dbName, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("documents")) {
          db.createObjectStore("documents");
        }
        if (!db.objectStoreNames.contains("blobs")) {
          db.createObjectStore("blobs");
        }
      },
    });

    try {
      const persisted = await navigator.storage.persist();
      if (!persisted) {
        console.warn(
          "[IndexedDBAdapter] navigator.storage.persist() was denied. Data may be evicted under storage pressure."
        );
      }
    } catch {
      // persist() is not supported in all environments; ignore failure
    }
  }

  private ensureDb(): IDBPDatabase<ShotsuDB> {
    if (!this.db) {
      throw new Error("IndexedDBAdapter not initialized. Call initialize() first.");
    }
    return this.db;
  }

  async getDoc<T>(key: string): Promise<T | null> {
    const db = this.ensureDb();
    const value = await db.get("documents", key);
    return value !== undefined ? (value as T) : null;
  }

  async setDoc<T>(key: string, value: T): Promise<void> {
    const db = this.ensureDb();
    await db.put("documents", value, key);
  }

  async deleteDoc(key: string): Promise<void> {
    const db = this.ensureDb();
    await db.delete("documents", key);
  }

  async putBlob(key: string, blob: Blob): Promise<void> {
    const db = this.ensureDb();
    await db.put("blobs", blob, key);
  }

  async getBlobURL(key: string): Promise<string> {
    const db = this.ensureDb();
    const blob = await db.get("blobs", key);
    if (!blob) {
      throw new Error(`Blob not found for key: ${key}`);
    }
    return URL.createObjectURL(blob);
  }

  async deleteBlob(key: string): Promise<void> {
    const db = this.ensureDb();
    await db.delete("blobs", key);
  }
}
