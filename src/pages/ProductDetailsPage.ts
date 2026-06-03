import { Page, expect } from "@playwright/test";
import { logger } from "@/utils/logger";

export class ProductDetailsPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Clicks the "Add to Cart" button for a product.
     * @param locator CSS or selector string identifying the add‑to‑cart button.
     */
    async clickAddToCart(locator: string): Promise<void> {
        const button = this.page.locator(locator);
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
        await Promise.all([
            this.page.waitForLoadState("networkidle"),
            button.click()
        ]);
        logger.info(`Clicked Add to Cart using locator: ${locator}`);
    }

    /**
     * Check whether you get Added to Cart Successfully message text
     */
    async verifyAddToCartSuccessMessage(locator: string): Promise<void> {
        const message = this.page.locator(locator);
        await expect(message).toBeVisible();
        await expect(message).toContainText("Added");
        await expect(message).toContainText("to cart successfully");
        logger.info("Added to Cart Successfully message verified");
    }
}