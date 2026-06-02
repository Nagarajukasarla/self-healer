
import { test } from "@playwright/test";
import { logger } from "../utils/logger";
import * as fs from "fs";
import { dbManager } from "@/core/db/DBManager";
import { HomePage } from "@/pages/HomePage";
import { ProductPage } from "@/pages/ProductPage";
import { runtimeConfig } from "@/config/runtime";


test.describe("CheckOut Verification tests", () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to a mock page containing our HTML elements
        await page.goto(runtimeConfig.targetUrl);
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

    test("Perform Checkout Order", async ({ page }) => {
        const homePage = new HomePage(page);
        const productsPage = new ProductPage(page);

        const shopNowButton = await dbManager.getLocator("home.hero.shop_now_button");

        if (shopNowButton) {
            await homePage.clickShopNow(shopNowButton);
        } else {
            logger.error("Shop Now button locator not found");
            throw new Error("Shop Now button locator not found");
        }

        const productsGrid = await dbManager.getLocator("products.list");

        if (productsGrid) {
            await productsPage.verifyProductsExist(productsGrid);
        } else {
            logger.error("Products list locator not found");
            throw new Error("Products list locator not found");
        }

        const firstProduct = await dbManager.getLocator("products.list.first_product_item");

        if (firstProduct) {
            await productsPage.selectTheFirstProduct(firstProduct);
        } else {
            logger.error("First product locator not found");
            throw new Error("First product locator not found");
        }
        
    });  

});
