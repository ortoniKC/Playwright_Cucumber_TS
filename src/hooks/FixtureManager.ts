import * as path from 'path';
import { Logger, createLogger } from "winston";
import { options } from "../helper/util/logger";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { invokeBrowser } from "../helper/browsers/browserManager";
import { ITestCaseHookParameter } from '@cucumber/cucumber';

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

export default class FixtureManager {
    browser: Browser;
    context: BrowserContext;
    scenario: ITestCaseHookParameter;
    page: Page;
    logger: Logger;

    private formatScenarioName() {
        const { pickle } = this.scenario;
        const pickleName = pickle.name.split(' ').join('-'); // Replace spaces with dashes
        return `${pickleName}_${pickle.id}`;
    }

    constructor() { }

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

    async openContext(hasAuth: boolean) {
        this.context = await this.browser.newContext({
            storageState: hasAuth ? getStorageState(this.ScenarioName) : undefined,
            recordVideo: {
                dir: "test-results/videos",
            }
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
}