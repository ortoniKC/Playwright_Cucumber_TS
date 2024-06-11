import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import RegisterPage from "../../pages/registerPage";
import Assert from "../../helper/wrapper/assert";
import * as data from "../../helper/util/test-data/registerUser.json";
import { IFixture } from "../../hooks/FixtureManager";
import * as ms from 'ms';
setDefaultTimeout(ms('2 minutes'))

let registerPage: RegisterPage;
let assert: Assert;

Given('I navigate to the register page', async function () {
    let fixture = this.fixture as IFixture
    registerPage = new RegisterPage(fixture.page);
    assert = new Assert(fixture.page);
    await registerPage.navigateToRegisterPage();
});

When('I created a new user', async function () {
    const username = data.userName + Date.now().toString();
    await registerPage.registerUser(data.firstName, data.lastName,
        username, data.password, data.confirmPassword, "m");
});

Then('I confirm user registration is success', async function () {
    await assert.assertURL("https://bookcart.azurewebsites.net/login");
});