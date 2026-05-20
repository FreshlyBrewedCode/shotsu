import { test, expect } from "@playwright/test";

test.describe("Published viewer", () => {
  test("renders published profile at /view?url=...", async ({ page }) => {
    const baseUrl = "https://test-published.example.com/";

    // Seed published data via route interception
    await page.route(`${baseUrl}profile.json`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "pub-profile-1",
          name: "Published Profile",
          bio: "A published bio",
          avatarPhotoId: null,
          sets: [{ id: "pub-set-1", title: "Published Set" }],
        }),
      });
    });

    await page.route(`${baseUrl}sets/pub-set-1.json`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "pub-set-1",
          title: "Published Set",
          coverPhotoId: null,
          sections: [
            { id: "sec-1", layout: "default", photos: [] },
          ],
        }),
      });
    });

    await page.goto(`/view?url=${encodeURIComponent(baseUrl + "profile.json")}`);
    await page.waitForLoadState("networkidle");

    // Verify profile name is visible
    await expect(page.getByText("Published Profile")).toBeVisible();
    // Verify set title is visible
    await expect(page.getByText("Published Set")).toBeVisible();
  });

  test("shows error for missing url parameter", async ({ page }) => {
    await page.goto("/view");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/missing \?url=/i)).toBeVisible();
  });

  test("shows error for failed fetch", async ({ page }) => {
    const baseUrl = "https://test-fail.example.com/";

    await page.route(`${baseUrl}profile.json`, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "text/plain",
        body: "Not found",
      });
    });

    await page.goto(`/view?url=${encodeURIComponent(baseUrl + "profile.json")}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/failed to fetch profile/i)).toBeVisible();
  });
});

test.describe("Edit mode toggle", () => {
  test("toggles edit mode via search param without page reload", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => window.__testAdapter !== undefined, {
      timeout: 10000,
    });

    // Seed a set
    await page.evaluate(async () => {
      const adapter = window.__testAdapter!;
      const set = {
        id: "test-set-1",
        title: "Test Set",
        coverPhotoId: null,
        sections: [
          {
            id: "section-1",
            layout: "default" as const,
            photos: [],
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
    });

    await page.reload();
    await page.waitForFunction(() => window.__testAdapter !== undefined, {
      timeout: 10000,
    });

    // Navigate to set viewer
    await page.goto("/me/sets/test-set-1");
    await page.waitForLoadState("networkidle");

    // Verify base URL
    await expect(page).toHaveURL(/\/me\/sets\/test-set-1$/);

    // Click Edit button
    const editButton = page.getByRole("link", { name: /edit/i });
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Verify URL changed to ?mode=edit
    await expect(page).toHaveURL(/\/me\/sets\/test-set-1\?mode=edit/);

    // Verify edit toolbar is visible
    await expect(page.getByRole("button", { name: /add section/i })).toBeVisible();

    // Cleanup
    await page.evaluate(async () => {
      await window.__testAdapter!.deleteDoc("profile");
      await window.__testAdapter!.deleteDoc("set:test-set-1");
    });
  });
});

test.describe("Username registry", () => {
  test("renders published profile at /p/demo", async ({ page }) => {
    const baseUrl = "https://demo.example.com/";

    await page.route(`${baseUrl}profile.json`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "demo-profile-1",
          name: "Demo Profile",
          bio: "A demo bio",
          avatarPhotoId: null,
          sets: [{ id: "demo-set-1", title: "Demo Set" }],
        }),
      });
    });

    await page.route(`${baseUrl}sets/demo-set-1.json`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "demo-set-1",
          title: "Demo Set",
          coverPhotoId: null,
          sections: [{ id: "sec-1", layout: "default", photos: [] }],
        }),
      });
    });

    await page.goto("/p/demo");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Demo Profile")).toBeVisible();
    await expect(page.getByText("Demo Set")).toBeVisible();
  });

  test("returns 404 for unknown username", async ({ page }) => {
    const response = await page.goto("/p/nonexistent");
    expect(response?.status()).toBe(404);
  });
});

test.describe("Publish flow", () => {
  test("publish button stores manifest in IndexedDB", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => window.__testAdapter !== undefined, {
      timeout: 10000,
    });

    // Seed a profile with a set and photo
    await page.evaluate(async () => {
      const adapter = window.__testAdapter!;
      const photoBlob = new Blob(["fake-webp"], { type: "image/webp" });
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
        id: "test-profile-1",
        name: "Test User",
        bio: "",
        avatarPhotoId: null,
        sets: [{ id: "test-set-1", title: "Test Set" }],
      };

      await adapter.setDoc("profile", profile);
      await adapter.setDoc("set:test-set-1", set);
      await adapter.setDoc("catalog-index", [{ id: "test-photo-1", filename: "test.webp" }]);
    });

    await page.reload();
    await page.waitForFunction(() => window.__testAdapter !== undefined, {
      timeout: 10000,
    });

    // Navigate to profile page
    await page.goto("/me");
    await page.waitForLoadState("networkidle");

    // Click publish button
    const publishButton = page.getByRole("button", { name: /publish/i });
    await expect(publishButton).toBeVisible();
    await publishButton.click();

    // Wait for publish to complete
    await expect(page.getByText(/view published/i)).toBeVisible({ timeout: 10000 });

    // Verify manifest was stored in IndexedDB
    const targets = await page.evaluate(async () => {
      return await window.__testAdapter!.getDoc("publish-targets");
    });

    const typedTargets = targets as Array<{
      publisherId: string;
      manifest: { generation: number };
    }>;
    expect(typedTargets).toBeDefined();
    expect(Array.isArray(typedTargets)).toBe(true);
    expect(typedTargets.length).toBeGreaterThan(0);
    expect(typedTargets[0].publisherId).toBe("zip");
    expect(typedTargets[0].manifest).toBeDefined();
    expect(typedTargets[0].manifest.generation).toBe(1);

    // Cleanup
    await page.evaluate(async () => {
      await window.__testAdapter!.deleteDoc("profile");
      await window.__testAdapter!.deleteDoc("set:test-set-1");
      await window.__testAdapter!.deleteDoc("catalog-index");
      await window.__testAdapter!.deleteDoc("publish-targets");
      await window.__testAdapter!.deleteBlob("photo:test-photo-1");
    });
  });
});
