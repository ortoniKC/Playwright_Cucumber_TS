import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { IFixture } from "../../../hooks/FixtureManager";
import PlaywrightWorld from "../../worlds/PlaywrightWorld";
import PageManager from "../../../hooks/PageManager";
import { normalizeUrl } from "../../../helper/util/helpers";

let pageManager: PageManager;

Given("I have created multiple pages with the following URLs and titles:", async function (dataTable: DataTable) {
    const fixture = this.fixture as IFixture;
    const { context } = fixture;

    pageManager = fixture.pageManager;

    const data = dataTable.hashes();
    for (const { url, title } of data) {
        await pageManager.newPage(context);
        await pageManager.Page.goto(url);
        expect(await pageManager.Page.title()).toBe(title);
    }
});

When("I select a page by index {int}", async function (index: number) {
    await pageManager.selectPage(index);
});

Then("the selected page should be on the expected URL {string}", async function (expectedUrl: string) {
    let actualUrl = await pageManager.Page.url();
    actualUrl = normalizeUrl(actualUrl)
    expectedUrl = normalizeUrl(expectedUrl)
    expect(actualUrl).toBe(expectedUrl);
});

Then("the selected page should have the expected title {string}", async function (expectedTitle: string) {
    const actualTitle = await pageManager.Page.title();
    expect(actualTitle).toBe(expectedTitle);
});

When("I close pages with indexes {string}", async function (indexesString: string) {
    const indexes = indexesString.split(',').map(index => parseInt(index.trim(), 10));
    this.closedPages = await Promise.all(indexes.map(index => pageManager.getPage(index)));
    await Promise.all(indexes.map(index => pageManager.closePage(index)));
});

Then("the closed pages should be closed", async function () {
    for (const closedPage of this.closedPages) {
        expect(closedPage).toBeDefined();
        expect(await closedPage.isClosed()).toBe(true);
    }
});

Then("the page manager should have {int} pages remaining", function (expectedCount: number) {
    const actualCount = pageManager.getPageCount();
    expect(actualCount).toBe(expectedCount);
});

When("I close all pages", async function () {
    await pageManager.closeAllPages();
});

Then("all pages should be closed", async function () {
    const allClosed = (await Promise.all(pageManager.Pages.map((page) => page.isClosed()))).every((isClosed) => isClosed);
    expect(allClosed).toBe(true);
});

Then("the page manager should be empty", function () {
    expect(pageManager.getPageCount()).toBe(0);
});

Then("the current page should be set to null", function () {
    expect(pageManager.Page).toBeNull();
});

When("I close all other pages except the current page", async function () {
    await pageManager.closeAllOtherPages();
});

Then("all other pages should be closed", async function () {
    const allOtherClosed = (await Promise.all(pageManager.Pages.filter((page) => page !== pageManager.Page).map((page) => page.isClosed()))).every((isClosed) => isClosed);
    expect(allOtherClosed).toBe(true);
});

Then("the page manager should only contain the current page", function () {
    expect(pageManager.getPageCount()).toBe(1);
    expect(pageManager.Pages[0]).toBe(pageManager.Page);
});

When("I get a page by URL {string}", async function (url: string) {
    this.page = await pageManager.getPageByURL(url);
});

Then("the page with the matching URL should be returned", async function () {
    expect(this.page).not.toBeUndefined();
    expect(await this.page.url()).toBe(this.page.url());
});

When("I get a page by title {string}", async function (title: string) {
    this.page = await pageManager.getPageByTitle(title);
});

Then("the page with the matching title {string} should be returned", async function (title: string) {
    expect(this.page).not.toBeUndefined();
    expect(await this.page.title()).toBe(title);
});

When("I select a page by URL {string}", async function (url: string) {
    await pageManager.selectPageByURL(url);
});

Then("the page with the matching URL should be selected", async function () {
    expect(await pageManager.Page.url()).toBe(pageManager.Page.url());
});

When("I select a page by title {string}", async function (title: string) {
    await pageManager.selectPageByTitle(title);
});

Then("the page with the matching title {string} should be selected", async function (title: string) {
    expect(await pageManager.Page.title()).toBe(title);
});

When("I get the page count", function () {
    this.pageCount = pageManager.getPageCount();
});

Then("the page count should be {int}", function (expectedCount: number) {
    expect(this.pageCount).toBe(expectedCount);
});

When("I get the current page index", function () {
    this.currentPageIndex = pageManager.getPageIndex();
});

Then("the current page index should be {int}", function (expectedIndex: number) {
    expect(this.currentPageIndex).toBe(expectedIndex);
});

When("I get the page index by page object", function () {
    this.pageIndex = pageManager.getPageIndex(pageManager.Page);
});

Then("the page index should be {int}", function (expectedIndex: number) {
    expect(this.pageIndex).toBe(expectedIndex);
});

When("I switch to the next page", async function () {
    await pageManager.switchToNextPage();
});

Then("the current page should be at index {int}", function (expectedIndex: number) {
    const currentIndex = pageManager.getPageIndex();
    expect(currentIndex).toBe(expectedIndex);
});

When("I switch to the previous page", async function () {
    await pageManager.switchToPreviousPage();
});