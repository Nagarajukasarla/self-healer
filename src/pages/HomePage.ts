import { Page, expect } from "@playwright/test";

export class HomePage {
    private page: Page;
    private locators: Record<string, string>;

    constructor(page: Page, locators: Record<string, string>) {
        this.page = page;
        this.locators = locators;
    }

    /**
     * Helper to retrieve a selector by its key.
     * Throws an error if the locator key is missing from the loaded DB mapping.
     */
    private getSelector(key: string): string {
        const selector = this.locators[key];
        if (!selector) {
            throw new Error(`Locator not found for key: ${key}`);
        }
        return selector;
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
    async clickShopNow(): Promise<void> {
        const selector = this.getSelector("button");
        const button = this.page.locator(selector);

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
    async checkProducts(): Promise<void> {
        const selector = this.getSelector("products");
        const products = this.page.locator(selector);

        await expect(products.first()).toBeVisible();

        const productCount = await products.count();

        expect(productCount).toBeGreaterThan(0);
    }

    /**
     * 4. Select a product 
     */
    async selectTheProduct(): Promise<void> {
        const selector = this.getSelector("product_1");
        const product = this.page.locator(selector);

        await expect(product).toBeVisible();
        await expect(product).toBeEnabled();

        await Promise.all([
            this.page.waitForLoadState("networkidle"),
            product.click()
        ]);
    }

    /**
     * 5. Add the selected item to cart
     */
    async addItemToCart(): Promise<void> {
        const selector = this.getSelector("add_to_cart_button");
        const addToCartButton = this.page.locator(selector);

        await expect(addToCartButton).toBeVisible();
        await expect(addToCartButton).toBeEnabled();

        await addToCartButton.click();
    }


    /**
     * 6. Go to cart
     */
    async goToCart(): Promise<void> {
        const selector = this.getSelector("cart_link");
        const cartLink = this.page.locator(selector);

        await expect(cartLink).toBeVisible();
        await cartLink.click();

        await this.page.waitForLoadState("networkidle");

        await expect(this.page).toHaveURL(/cart/);
    }

    /**
     * 6. Navigate to Checkout
     */
    async proceedToCheckout(): Promise<void> {
        const selector = this.getSelector("checkout_button");
        const checkoutButton = this.page.locator(selector);

        await expect(checkoutButton).toBeVisible();
        await expect(checkoutButton).toBeEnabled();

        await checkoutButton.click();

        await this.page.waitForLoadState("networkidle");

        await expect(this.page).toHaveURL(/checkout/);
    }
}
