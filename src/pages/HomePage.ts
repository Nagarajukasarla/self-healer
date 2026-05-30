import { Page, expect } from "@playwright/test";

export class HomePage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * 1. Checks that the headline text is visible.
     * @param expectedTitle shopco
     * 
     */
    async verifyPageIsLoaded(expectedTitle?: string): Promise<void> {
        await expect(this.page).toHaveTitle(/.+/);

        if (expectedTitle) {
            await expect(this.page).toHaveTitle(
                new RegExp(expectedTitle, "i")
            );
        }
    }

    /**
     * 2. Click that button to start shopping.
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
     * 3. Checks all the products 
     */
    async checkProducts(): Promise<void> {}

    /**
     * 4. Select a product 
     */
    async selectTheProduct(): Promise<void> {}

    /**
     * 5. Add the selected item to cart
     */
    async addItemToCart(): Promise<void> {}


    /**
     * 6. Go to cart
     */
    async goToCart(): Promise<void> { }

    /**
     * 6. Navigate to Checkout
     */
    async proceedToCheckout(): Promise<void> { }
}
