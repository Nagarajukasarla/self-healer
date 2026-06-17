import test from "@playwright/test";
import { logger } from "@/utils/logger";
import * as fs from "fs";
import * as path from "path";
import { dbManager } from "@/core/db/DBManager";
import { HomePage } from "@/pages/HomePage";
import { runtimeConfig } from "@/config/runtime";


test.describe("Home Page Verification tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(runtimeConfig.targetUrl);
    });

    test.afterEach(async ({ page }, testInfo) => {

        const html = await page.content();

        const htmlPath = testInfo.outputPath("page.html");

        // Ensure directories exist
        const htmlDir = path.dirname(htmlPath);
        if (!fs.existsSync(htmlDir)) {
            fs.mkdirSync(htmlDir, { recursive: true });
        }

        fs.writeFileSync(htmlPath, html);

        testInfo.attachments.push({
            name: "page-source",
            path: htmlPath,
            contentType: "text/html",
        });

        const urlPath = testInfo.outputPath("page-url.txt");

        const urlDir = path.dirname(urlPath);
        if (!fs.existsSync(urlDir)) {
            fs.mkdirSync(urlDir, { recursive: true });
        }

        fs.writeFileSync(urlPath, page.url());

        testInfo.attachments.push({
            name: "page-url",
            path: urlPath,
            contentType: "text/plain",
        });
    });

    test("1. Verify page title", async ({ page }) => {
        const homePage = new HomePage(page);

        const pageTitle = await dbManager.getLocator("home.page_title.shopco");

        if (pageTitle) {
            console.log("LOCATOR_KEY:home.page_title.shopco");
            await homePage.verifyPageTitle(pageTitle);
        } else {
            logger.error("Page title locator not found");
            throw new Error("Page title locator not found");
        }
    });

    // enter mens jeans  n search input
    test("2. Enter sample text in search input", async ({ page }) => {
        const homePage = new HomePage(page);

        const searchInput = await dbManager.getLocator("home.navbar.search_input");

        if (searchInput) {
            console.log("LOCATOR_KEY:home.navbar.search_input");
            await homePage.performSearch(searchInput, "Mens Jeans");
        } else {
            logger.error("Mens jeans search input locator not found");
            throw new Error("Mens jeans search input locator not found");
        }
    });
    
});
    