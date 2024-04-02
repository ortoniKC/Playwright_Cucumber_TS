import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { IFixture } from "../../hooks/FixtureManager";
import * as ms from 'ms';
setDefaultTimeout(ms('2 minutes'))

Given('user search for a {string}', async function (book) {
    let fixture = this.fixture as IFixture
    fixture.logger.info("Searching for a book: " + book)
    await fixture.page.locator("input[type='search']").type(book);
    await fixture.page.waitForTimeout(2000);
    await fixture.page.locator("mat-option[role='option'] span").click();
});

When('user add the book to the cart', async function () {
    let fixture = this.fixture as IFixture
    await fixture.page.locator("//button[@color='primary']").click();
    const toast = fixture.page.locator("simple-snack-bar");
    await expect(toast).toBeVisible();
    await toast.waitFor({ state: "hidden" })
});

Then('the cart badge should get updated', async function () {
    let fixture = this.fixture as IFixture
    const badgeCount = await fixture.page.locator("#mat-badge-content-0").textContent();
    expect(Number(badgeCount)).toBeGreaterThan(0);
});
