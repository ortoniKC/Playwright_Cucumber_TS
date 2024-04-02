import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { FixtureManager } from "../../hooks/hooks";
setDefaultTimeout(60 * 1000 * 2)

Given('user search for a {string}', async function (book) {
    let fixture = this.fixture as FixtureManager
    fixture.logger.info("Searching for a book: " + book)
    await fixture.page.locator("input[type='search']").type(book);
    await fixture.page.waitForTimeout(2000);
    await fixture.page.locator("mat-option[role='option'] span").click();
});
When('user add the book to the cart', async function () {
    let fixture = this.fixture as FixtureManager
    await fixture.page.locator("//button[@color='primary']").click();
    const toast = fixture.page.locator("simple-snack-bar");
    await expect(toast).toBeVisible();
    await toast.waitFor({ state: "hidden" })
});
Then('the cart badge should get updated', async function () {
    let fixture = this.fixture as FixtureManager
    const badgeCount = await fixture.page.locator("#mat-badge-content-0").textContent();
    expect(Number(badgeCount)).toBeGreaterThan(0);
});
