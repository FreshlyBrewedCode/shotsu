import { test, expect } from "@playwright/test";

test.describe("Smoke: app boots cleanly", () => {
  test("no console errors from storage or profile code", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Ignore pre-existing image loading errors from the home page
        if (text.includes("Failed to load resource") && text.includes("400")) return;
        consoleErrors.push(text);
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(() => window.__testAdapter !== undefined, {
      timeout: 10000,
    });

    expect(consoleErrors).toHaveLength(0);
  });

  test("adapter document and blob round-trips persist across reload", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => window.__testAdapter !== undefined, {
      timeout: 10000,
    });

    // Document round-trip
    await page.evaluate(async () => {
      await window.__testAdapter!.setDoc("smoke/doc", { hello: "world" });
    });

    await page.reload();
    await page.waitForFunction(() => window.__testAdapter !== undefined, {
      timeout: 10000,
    });

    const doc = await page.evaluate(async () => {
      return await window.__testAdapter!.getDoc("smoke/doc");
    });
    expect(doc).toEqual({ hello: "world" });

    // Blob round-trip
    await page.evaluate(async () => {
      const blob = new Blob(["blob content"], { type: "text/plain" });
      await window.__testAdapter!.putBlob("smoke/blob", blob);
    });

    await page.reload();
    await page.waitForFunction(() => window.__testAdapter !== undefined, {
      timeout: 10000,
    });

    const blobText = await page.evaluate(async () => {
      const url = await window.__testAdapter!.getBlobURL("smoke/blob");
      const text = await fetch(url).then((r: Response) => r.text());
      URL.revokeObjectURL(url);
      return text;
    });
    expect(blobText).toBe("blob content");

    // Cleanup
    await page.evaluate(async () => {
      await window.__testAdapter!.deleteDoc("smoke/doc");
      await window.__testAdapter!.deleteBlob("smoke/blob");
    });
  });
});
