import { Given, When, Then } from "@cucumber/cucumber";

import { chromium, Page, Browser, expect } from "@playwright/test";

let browser: Browser;
let page: Page;

Given('User navigates to the application', async function () {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    await page.goto("https://bookcart.azurewebsites.net/");
})

Given('User click on the login link', async function () {
    await page.locator("//span[text()='Login']").click();
});

Given('User enter the username as {string}', async function (username) {
    await page.locator("input[formcontrolname='username']").type(username);
});

Given('User enter the password as {string}', async function (password) {
    await page.locator("input[formcontrolname='password']").type(password);
})
Given('user search for a {string}', async function (book) {
    await page.locator("input[type='search']").type(book);
    await page.locator("mat-option[role='option'] span").click();
});
When('user add the book to the cart', async function () {
    await page.locator("//button[@color='primary']").click();
});
Then('the cart badge should get updated', async function () {
    const badgeCount = await page.locator("#mat-badge-content-0").textContent();
    expect(Number(badgeCount?.length)).toBeGreaterThan(0);
});
