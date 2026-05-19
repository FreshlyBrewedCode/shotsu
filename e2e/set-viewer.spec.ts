import { test, expect } from "@playwright/test";

test.describe("Set viewer", () => {
  test("renders a set without edit toolbar and shows photos", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => window.__testAdapter !== undefined, {
      timeout: 10000,
    });

    // Seed a set with a photo via the adapter
    await page.evaluate(async () => {
      const adapter = window.__testAdapter!;
      const photoBlob = new Blob(["fake-image"], { type: "image/png" });
      await adapter.putBlob("photo:test-photo-1", photoBlob);

      const set = {
        id: "test-set-1",
        title: "Test Set",
        coverPhotoId: "test-photo-1",
        sections: [
          {
            id: "section-1",
            layout: "default" as const,
            photos: [{ id: "test-photo-1" }],
          },
        ],
      };

      const profile = {
        name: "Test User",
        bio: "",
        avatarPhotoId: null,
        sets: [{ id: "test-set-1", title: "Test Set" }],
      };

      await adapter.setDoc("profile", profile);
      await adapter.setDoc("set:test-set-1", set);
      await adapter.setDoc("catalog-index", [{ id: "test-photo-1", filename: "test.png" }]);
    });

    await page.reload();
    await page.waitForFunction(() => window.__testAdapter !== undefined, {
      timeout: 10000,
    });

    // Navigate to the viewer
    await page.goto("/sets/test-set-1");
    await page.waitForLoadState("networkidle");

    // Verify title is visible
    await expect(page.getByText("Test Set")).toBeVisible();

    // Verify no edit toolbar
    await expect(page.getByRole("button", { name: /add section/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /remove section/i })).not.toBeVisible();

    // Verify photos render (PhotoBlob should eventually show an img)
    const img = page.locator("img[alt='Photo']");
    await expect(img).toBeVisible();

    // Cleanup
    await page.evaluate(async () => {
      await window.__testAdapter!.deleteDoc("profile");
      await window.__testAdapter!.deleteDoc("set:test-set-1");
      await window.__testAdapter!.deleteDoc("catalog-index");
      await window.__testAdapter!.deleteBlob("photo:test-photo-1");
    });
  });
});
