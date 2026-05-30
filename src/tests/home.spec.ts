import { test } from "@playwright/test";
import { logger } from "../utils/logger";
import * as fs from "fs";
import { dbManager } from "@/core/db/DBManager";
import { HomePage } from "@/pages/HomePage";


test.describe("Home Page Verification tests", () => {

    // For now I don't these locators and beforeAllTest 
    // let locators: Record<string, string>;
    // test.beforeAll(async () => {
    //     try {
    //         // Try to load locators from PostgreSQL DB
    //         locators = await new DbManager().getLocatorData("home.page");
    //         logger.info("Successfully fetched locators from PostgreSQL database.");
    //     } catch (error) {
    //         logger.warn(
    //             { error },
    //             "Database is unavailable or table does not exist."
    //         );
    //     }
    // });

    test.beforeEach(async ({ page }) => {
        // Navigate to a mock page containing our HTML elements
        await page.goto("http://localhost:5173/");
    });

    test.afterEach(async ({ page }, testInfo) => {

        const html = await page.content();

        const htmlPath = testInfo.outputPath("page.html");

        fs.writeFileSync(htmlPath, html);

        testInfo.attachments.push({
            name: "page-source",
            path: htmlPath,
            contentType: "text/html",
        });

        const urlPath = testInfo.outputPath("page-url.txt");

        fs.writeFileSync(urlPath, page.url());

        testInfo.attachments.push({
            name: "page-url",
            path: urlPath,
            contentType: "text/plain",
        });
    });

    test("1. Click on Shop Now button", async ({ page }) => {
        const homePage = new HomePage(page);

        const shopNowButton = await dbManager.getLocator("home.hero.shop_now_button");

        if (shopNowButton) {
            await homePage.clickShopNow(shopNowButton);
        } else {
            logger.error("Shop Now button locator not found");
            throw new Error("Shop Now button locator not found");
        }
    });  

});
