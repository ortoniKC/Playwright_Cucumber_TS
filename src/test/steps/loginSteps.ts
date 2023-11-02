import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";

import { expect } from "@playwright/test";
import { fixture } from "../../hooks/pageFixture";

setDefaultTimeout(60 * 1000 * 2)

Given('User navigates to the application', async function () {
    await fixture.page.goto(process.env.BASEURL);
    fixture.logger.info("Navigated to the application")
})

Given('User click on the login link', async function () {
    await fixture.page.locator("//span[text()='Login']").click();
});

Given('User enter the username as {string}', async function (username) {
    await fixture.page.locator("input[formcontrolname='username']").type(username);
});

Given('User enter the password as {string}', async function (password) {
    await fixture.page.locator("input[formcontrolname='password']").type(password);
})

When('User click on the login button', async function () {
    await fixture.page.locator("button[color='primary']").click();
    await fixture.page.waitForLoadState();
    fixture.logger.info("Waiting for 2 seconds")
    await fixture.page.waitForTimeout(2000);
});


Then('Login should be success', async function () {
    const user = fixture.page.locator("//button[contains(@class,'mat-focus-indicator mat-menu-trigger')]//span[1]");
    await expect(user).toBeVisible();
    const userName = await user.textContent();
    console.log("Username: " + userName);
    fixture.logger.info("Username: " + userName);
})

When('Login should fail', async function () {
    const failureMesssage = fixture.page.locator("mat-error[role='alert']");
    await expect(failureMesssage).toBeVisible();
});
