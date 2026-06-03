import { logger } from "@/utils/logger";
import { Page, expect } from "@playwright/test";

export class HomePage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Checks that the headline text is visible.
     * @param expectedTitle shopco
     * 
     */
    async verifyPageTitle(_locator: string): Promise<void> {
        await expect(this.page).toHaveTitle("shopco");
        logger.info("Page title is verified using page.toHaveTitle");
    }

    /**
     * Click that button to start shopping.
     */
    async clickShopNow(locator: string): Promise<void> {
        const button = this.page.locator(locator);

        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();

        await Promise.all([
            this.page.waitForLoadState("networkidle"),
            button.click()
        ]);
    }

    /**
     * Go to cart
     */
    async goToCart(locator: string): Promise<void> { 
        const button = this.page.locator(locator);
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
        await Promise.all([
            this.page.waitForLoadState("networkidle"),
            button.click()
        ]);
        logger.info(`Clicked Go to Cart using locator: ${locator}`);
    }

    /**
     * Perform search
     */
    async performSearch(locator: string, text: string): Promise<void> {
        const searchInput = this.page.locator(locator);
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toBeEnabled();
        await searchInput.fill(text);
        await searchInput.press("Enter");
        logger.info(`Performed search for ${text} using locator: ${locator}`);
    }
}
