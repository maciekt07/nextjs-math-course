import { expect, test } from "@playwright/test";

test.describe("Landing", () => {
  test("hero demo link navigates to first lesson", async ({ page }) => {
    await page.goto("/");

    const demoBtn = page.getByRole("link", { name: /watch free demo/i });

    await expect(demoBtn).toBeVisible();
    const href = await demoBtn.getAttribute("href");

    expect(href).not.toBe("#");

    await demoBtn.click();
    await page.waitForURL((url) => url.pathname !== "/", { timeout: 20000 });
    await expect(page).not.toHaveURL("/");
  });

  test("explore courses button scrolls to courses section", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /explore courses/i }).click();

    await expect(page.locator("#courses")).toBeInViewport();
  });
});
