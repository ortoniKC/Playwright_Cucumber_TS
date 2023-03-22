import { Given, When, Then } from "@cucumber/cucumber"
import { Browser, chromium, expect, Page } from "@playwright/test"

let browser: Browser;
let page: Page;
Given('User navigates to the application', async function () {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    await page.goto("https://bookcart.azurewebsites.net")
});

Given('User click on the login link', async function () {
    await page.locator("//span[text()='Login']").click();
});

Given('User enter the username as {string}', async function (username) {
    await page.locator("//input[@formcontrolname='username']").type(username);
});


Given('User enter the password as {string}', async function (password) {
    await page.locator("//input[@formcontrolname='password']").type(password);
});


When('User click on the login button', async function () {
    await page.locator("//button[@color='primary']").click();
});

When('Login should fail', async function () {
    const alertElement = page.locator("//mat-error[@role='alert']");
    await expect(alertElement).toHaveText("Username or Password is incorrect.");
    await page.close();
    await browser.close();
});

Then('Login should be success', async function () {
    const user = page.locator("//button[contains(@class,'mat-focus-indicator mat-menu-trigger')]//span[1]");
    console.log(await user.textContent());
    await expect(user).toContainText("ortoni");
    await page.close();
    await browser.close();
});