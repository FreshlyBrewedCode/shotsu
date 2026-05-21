import { describe, it, expect, beforeEach } from "vitest";
import { IndexedDBAdapter } from "./indexeddb-adapter";

describe("IndexedDBAdapter contract", () => {
  let adapter: IndexedDBAdapter;
  let dbName: string;

  beforeEach(async () => {
    dbName = `test-db-${Math.random().toString(36).slice(2)}`;
    adapter = new IndexedDBAdapter({ dbName });
    await adapter.initialize();
  });

  it("round-trips JSON documents", async () => {
    const data = { message: "hello", count: 42 };
    await adapter.setDoc("test/doc", data);
    const result = await adapter.getDoc<typeof data>("test/doc");
    expect(result).toEqual(data);
  });

  it("returns null for missing document keys", async () => {
    const result = await adapter.getDoc("does/not/exist");
    expect(result).toBeNull();
  });

  it("deletes documents", async () => {
    await adapter.setDoc("to-delete", { value: 1 });
    await adapter.deleteDoc("to-delete");
    const result = await adapter.getDoc("to-delete");
    expect(result).toBeNull();
  });

  it("throws when fetching a missing blob", async () => {
    await expect(adapter.getBlobURL("missing/blob")).rejects.toThrow("not found");
  });

  it("deletes blobs", async () => {
    await adapter.putBlob("to-delete", new Blob(["x"]));
    await adapter.deleteBlob("to-delete");
    await expect(adapter.getBlobURL("to-delete")).rejects.toThrow("not found");
  });
});
