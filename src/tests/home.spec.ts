import { test, expect } from "@playwright/test";
import { dbManager } from "../core/locator-manager/db-manager";
import { HomePage } from "../pages/home.page";
import { logger } from "../utils/logger";

// Default/fallback locators in case DB is unreachable
const DEFAULT_LOCATORS: Record<string, string> = {
    headline: "h1.headline",
    button: "button#regular-btn",
    toggle_button: "button#toggle-btn77",
    dropdown: "select#my-dropdown",
};

// HTML content for testing the page elements locally
const MOCK_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mock Self-Healer Home Page</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .headline { color: #2c3e50; }
    button { margin: 10px 0; padding: 8px 16px; cursor: pointer; }
    select { display: block; margin-top: 10px; padding: 5px; }
  </style>
</head>
<body>
  <h1 class="headline">Self-Healing Automation Dashboard</h1>
  
  <div>
    <button id="regular-btn">Regular Click</button>
  </div>
  
  <div>
    <button id="toggle-btn">Toggle State: OFF</button>
  </div>
  
  <div>
    <label for="my-dropdown">Select Option:</label>
    <select id="my-dropdown">
      <option value="opt1">Option One</option>
      <option value="opt2">Option Two</option>
      <option value="opt3">Option Three</option>
    </select>
  </div>

  <script>
    // Toggle button behavior
    const toggleBtn = document.getElementById("toggle-btn");
    toggleBtn.addEventListener("click", () => {
      if (toggleBtn.innerText === "Toggle State: OFF") {
        toggleBtn.innerText = "Toggle State: ON";
      } else {
        toggleBtn.innerText = "Toggle State: OFF";
      }
    });
  </script>
</body>
</html>
`;

test.describe("Home Page Verification tests", () => {
    let locators: Record<string, string>;

    test.beforeAll(async () => {
        try {
            // Try to load locators from PostgreSQL DB
            locators = await dbManager.getLocators("home");
            logger.info("Successfully fetched locators from PostgreSQL database.");
        } catch (error) {
            logger.warn(
                { error },
                "Database is unavailable or table does not exist. Falling back to local default locators."
            );
            // Fallback to local config so tests can run in environments without database access
            locators = DEFAULT_LOCATORS;
        }
    });

    test.afterAll(async () => {
        try {
            // Clean up PostgreSQL connection pool
            await dbManager.close();
        } catch (error) {
            logger.error({ error }, "Error closing database connection pool");
        }
    });

    test.beforeEach(async ({ page }) => {
        // Navigate to a mock page containing our HTML elements
        await page.setContent(MOCK_HTML);
    });

    test("1. Check headline text is visible", async ({ page }) => {
        const homePage = new HomePage(page, locators);
        await homePage.checkHeadlineVisible("Self-Healing Automation Dashboard");
    });

    test("2. Check regular button is visible", async ({ page }) => {
        const homePage = new HomePage(page, locators);
        await homePage.checkButtonVisible();
    });

    test("3. Check regular button is clickable", async ({ page }) => {
        const homePage = new HomePage(page, locators);
        await homePage.checkButtonClickable();
    });

    test("4. Check toggle   button updates state and text on click", async ({ page }) => {
        const homePage = new HomePage(page, locators);
        await homePage.toggleButtonAndVerifyChanges();
    });

    test("5. Select options in dropdown and verify selected choice", async ({ page }) => {
        const homePage = new HomePage(page, locators);

        // Select Option Two
        await homePage.selectDropdown("opt2");

        // Select Option Three
        await homePage.selectDropdown("opt3");
    });
});
