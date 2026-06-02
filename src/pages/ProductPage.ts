import { Page, expect } from "@playwright/test";
import { logger } from "@/utils/logger"

export class ProductPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async verifyProductsExist(locator: string): Promise<void> {
        const productsGrid = this.page.locator(locator);

        await expect(productsGrid).toBeVisible();

        const productCount = await productsGrid.locator("a").count();

        expect(productCount).toBeGreaterThan(0);

        logger.info(`Found ${productCount} products`);
    }

    async selectTheFirstProduct(locator: string): Promise<void> {
        const productsGrid = this.page.locator(locator);
        const productLinks = productsGrid.locator('a');
        const productCount = await productLinks.count();
        if (productCount > 0) {
            await productLinks.first().click();
            logger.info(`Clicked on first product out of ${productCount}`);
        } else {
            logger.warn('No products found to select');
        }
    }
}
