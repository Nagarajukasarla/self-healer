# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> Home Page Verification tests >> 4. Check toggle   button updates state and text on click
- Location: src\tests\home.spec.ts:110:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.innerText: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button#toggle-btn77')

```

# Test source

```ts
  1  | import { Page, expect } from "@playwright/test";
  2  | 
  3  | export class HomePage {
  4  |     private page: Page;
  5  |     private locators: Record<string, string>;
  6  | 
  7  |     constructor(page: Page, locators: Record<string, string>) {
  8  |         this.page = page;
  9  |         this.locators = locators;
  10 |     }
  11 | 
  12 |     /**
  13 |      * Helper to retrieve a selector by its key.
  14 |      * Throws an error if the locator key is missing from the loaded DB mapping.
  15 |      */
  16 |     private getSelector(key: string): string {
  17 |         const selector = this.locators[key];
  18 |         if (!selector) {
  19 |             throw new Error(`Locator not found for key: ${key}`);
  20 |         }
  21 |         return selector;
  22 |     }
  23 | 
  24 |     /**
  25 |      * 1. Checks that the headline text is visible.
  26 |      */
  27 |     async checkHeadlineVisible(expectedText?: string): Promise<void> {
  28 |         const selector = this.getSelector("headline");
  29 |         const headline = this.page.locator(selector);
  30 |         await expect(headline).toBeVisible();
  31 |         if (expectedText) {
  32 |             await expect(headline).toHaveText(expectedText);
  33 |         }
  34 |     }
  35 | 
  36 |     /**
  37 |      * 2. Checks that the button is visible.
  38 |      */
  39 |     async checkButtonVisible(): Promise<void> {
  40 |         const selector = this.getSelector("button");
  41 |         const button = this.page.locator(selector);
  42 |         await expect(button).toBeVisible();
  43 |     }
  44 | 
  45 |     /**
  46 |      * 3. Checks that the button is clickable (enabled).
  47 |      */
  48 |     async checkButtonClickable(): Promise<void> {
  49 |         const selector = this.getSelector("button");
  50 |         const button = this.page.locator(selector);
  51 |         await expect(button).toBeEnabled();
  52 |     }
  53 | 
  54 |     /**
  55 |      * 4. Verifies whether the toggle button is making changes (toggling state/text).
  56 |      */
  57 |     async toggleButtonAndVerifyChanges(): Promise<void> {
  58 |         const selector = this.getSelector("toggle_button");
  59 |         const toggleBtn = this.page.locator(selector);
  60 | 
  61 |         // Read current state before clicking
> 62 |         const initialText = await toggleBtn.innerText();
     |                                             ^ Error: locator.innerText: Test timeout of 30000ms exceeded.
  63 | 
  64 |         // Click the toggle button
  65 |         await toggleBtn.click();
  66 | 
  67 |         // Read state after click and assert it changed
  68 |         const postClickText = await toggleBtn.innerText();
  69 |         expect(postClickText).not.toBe(initialText);
  70 |     }
  71 | 
  72 |     /**
  73 |      * 5. Selects the dropdown option and verifies the choice.
  74 |      */
  75 |     async selectDropdown(value: string): Promise<void> {
  76 |         const selector = this.getSelector("dropdown");
  77 |         const dropdown = this.page.locator(selector);
  78 | 
  79 |         // Select the option in the dropdown list
  80 |         await dropdown.selectOption(value);
  81 | 
  82 |         // Verify that the chosen value matches the input
  83 |         const selectedValue = await dropdown.inputValue();
  84 |         expect(selectedValue).toBe(value);
  85 |     }
  86 | }
  87 | 
```