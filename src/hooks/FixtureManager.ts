import * as path from 'path';
import { Logger, createLogger } from "winston";
import { options } from "../helper/util/logger";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { invokeBrowser } from "../helper/browsers/browserManager";
import ScenarioManager from './ScenarioManager';
import { ITestCaseHookParameter } from '@cucumber/cucumber';
import PageManager from './PageManager';

export interface IFixture {
    browser: Browser;
    context: BrowserContext;
    pageManager: PageManager;
    page: Page;
    logger: Logger;
    scenario: ScenarioManager;
}

export default class FixtureManager implements IFixture {
    browser: Browser;
    context: BrowserContext;
    pageManager: PageManager;
    page: Page;
    logger: Logger;
    scenario: ScenarioManager;

    constructor() {
        this.pageManager = new PageManager();
    }

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
            pageManager: this.pageManager,
            page: this.pageManager.Page,
            logger: this.logger,
            scenario: this.scenario,
        }
    }

    setScenario(s: ITestCaseHookParameter) {
        this.scenario = new ScenarioManager(s);
    }

    clearScenario() {
        this.scenario = null;
    }

    async openBrowser() {
        this.browser = await invokeBrowser()
    }

    async closeBrowser() {
        await this.browser.close();
    }

    async openContext() {
        this.context = await this.browser.newContext({
            storageState: this.scenario.hasTag('@auth') ? getStorageState(this.scenario.DashedName) : undefined,
            recordVideo: this.scenario.hasTag('@disable:video') ? undefined : { dir: "test-results/videos" }
        });
    }

    async newPage() {
        await this.pageManager.newPage(this.context);
    }

    async closeAllPages() {
        await this.pageManager.closeAllPages();
    }

    async createLogger() {
        this.logger = createLogger(options(this.scenario.DashedName));
    }

    async closeContext() {
        await this.context.close();
    }

    async startTracing() {
        if (this.scenario.hasTag('@disable:trace')) return;
        await this.context.tracing.start({
            name: this.scenario.DashedName,
            title: this.scenario.Title,
            sources: true,
            screenshots: true,
            snapshots: true
        });
    }

    async stopTracing() {
        if (this.scenario.hasTag('@disable:trace')) return;
        const tracePath = path.join(__dirname, `../../test-results/trace/${this.scenario.DashedName}.zip`);
        await this.context.tracing.stop({ path: tracePath });
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