import * as path from 'path';
import { Logger, createLogger } from "winston";
import { options } from "../helper/util/logger";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { invokeBrowser } from "../helper/browsers/browserManager";
import { ITestCaseHookParameter } from '@cucumber/cucumber';

export interface IFixture {
    browser: Browser;
    context: BrowserContext;
    page: Page;
    logger: Logger;
    scenario: ITestCaseHookParameter;
}

export default class FixtureManager implements IFixture {
    browser: Browser;
    context: BrowserContext;
    page: Page;
    logger: Logger;
    scenario: ITestCaseHookParameter;

    constructor() { }

    /**
     * Provides access to the current test fixture.
     * 
     * This getter returns an object conforming to the IFixture interface, 
     * segregating the interface from the FixtureManager implementation. 
     * This allows consumers to interact with the test fixture without 
     * needing to know about the underlying FixtureManager details.
     * 
     * @returns {IFixture} The current test fixture.
     */
    get Fixture(): IFixture {
        return {
            browser: this.browser,
            context: this.context,
            page: this.page,
            logger: this.logger,
            scenario: this.scenario
        }
    }

    set Scenario(scenario: ITestCaseHookParameter) {
        this.scenario = scenario;
    }

    get Scenario() {
        return this.scenario;
    }

    get ScenarioName() {
        return this.formatScenarioName();
    }

    async openBrowser() {
        this.browser = await invokeBrowser()
    }

    async closeBrowser() {
        await this.browser.close();
    }

    async openContext() {
        this.context = await this.browser.newContext({
            storageState: this.hasTag('@auth') ? getStorageState(this.ScenarioName) : undefined,
            recordVideo: !this.hasTag('@api') ? { dir: "test-results/videos" } : undefined
        });
    }

    async newPage() {
        this.page = await this.context.newPage();
    }

    async createLogger() {
        this.logger = createLogger(options(this.ScenarioName));
    }

    async closePage() {
        await this.page.close();
    }

    async closeContext() {
        await this.context.close();
    }

    async startTracing() {
        await this.context.tracing.start({
            name: this.ScenarioName,
            title: this.scenario.pickle.name,
            sources: true,
            screenshots: true,
            snapshots: true
        });
    }

    async stopTracing() {
        const tracePath = path.join(__dirname, `../../test-results/trace/${this.ScenarioName}.zip`);
        await this.context.tracing.stop({ path: tracePath });
    }

    private hasTag(tagName: string): boolean {
        const { pickle } = this.Scenario;
        return Boolean(pickle.tags.find((tag) => tag.name === tagName));
    }

    private formatScenarioName() {
        const { pickle } = this.Scenario;
        const pickleName = pickle.name.split(' ').join('-'); // Replace spaces with dashes
        return `${pickleName}_${pickle.id}`;
    }
}

type StorageState = string | {
    cookies: {
        name: string;
        value: string;
        domain: string;
        path: string;
        expires: number;
        httpOnly: boolean;
        secure: boolean;
        sameSite: "Strict" | "Lax" | "None";
    }[];
    origins: {
        origin: string;
        localStorage: {
            name: string;
            value: string;
        }[];
    }[];
};

function getStorageState(user: string): StorageState {
    if (user.endsWith("admin"))
        return "src/helper/auth/admin.json";
    else if (user.endsWith("lead"))
        return "src/helper/auth/lead.json";
}