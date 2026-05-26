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
     */
    async checkHeadlineVisible(expectedText?: string): Promise<void> {
        const selector = this.getSelector("headline");
        const headline = this.page.locator(selector);
        await expect(headline).toBeVisible();
        if (expectedText) {
            await expect(headline).toHaveText(expectedText);
        }
    }

    /**
     * 2. Checks that the button is visible.
     */
    async checkButtonVisible(): Promise<void> {
        const selector = this.getSelector("button");
        const button = this.page.locator(selector);
        await expect(button).toBeVisible();
    }

    /**
     * 3. Checks that the button is clickable (enabled).
     */
    async checkButtonClickable(): Promise<void> {
        const selector = this.getSelector("button");
        const button = this.page.locator(selector);
        await expect(button).toBeEnabled();
    }

    /**
     * 4. Verifies whether the toggle button is making changes (toggling state/text).
     */
    async toggleButtonAndVerifyChanges(): Promise<void> {
        const selector = this.getSelector("toggle_button");
        const toggleBtn = this.page.locator(selector);

        // Read current state before clicking
        const initialText = await toggleBtn.innerText();

        // Click the toggle button
        await toggleBtn.click();

        // Read state after click and assert it changed
        const postClickText = await toggleBtn.innerText();
        expect(postClickText).not.toBe(initialText);
    }

    /**
     * 5. Selects the dropdown option and verifies the choice.
     */
    async selectDropdown(value: string): Promise<void> {
        const selector = this.getSelector("dropdown");
        const dropdown = this.page.locator(selector);

        // Select the option in the dropdown list
        await dropdown.selectOption(value);

        // Verify that the chosen value matches the input
        const selectedValue = await dropdown.inputValue();
        expect(selectedValue).toBe(value);
    }
}
