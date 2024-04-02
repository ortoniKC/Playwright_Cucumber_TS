import { BeforeAll, AfterAll, Before, After, Status, ITestCaseHookParameter, IWorld, setWorldConstructor } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { invokeBrowser } from "../helper/browsers/browserManager";
import { getEnv } from "../helper/env/env";
import { Logger, createLogger } from "winston";
import { options } from "../helper/util/logger";
import * as fs from 'fs-extra';
import * as path from 'path';
import PlaywrightWorld from "../test/worlds/PlaywrightWorld";

let fx: FixtureManager

// setWorldConstructor(PlaywrightWorld);

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

export class FixtureManager {
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

BeforeAll(async function () {
    getEnv();
    fx = new FixtureManager();
    await fx.openBrowser();
});

Before(async function (this: PlaywrightWorld, scenario) {
    fx.Scenario = scenario;

    const hasAuth = Boolean(scenario.pickle.tags.find((tag) => tag.name === '@auth'));
    await fx.openContext(hasAuth);
    await fx.startTracing();
    await fx.newPage();
    await fx.createLogger();

    this.fixture = fx;
});

type Media = {
    img: Buffer | null;
    videoPath: string | null;
};

class ArtifactManager {
    media: Media;
    shouldAttachMedia: boolean;
    shouldAttachTrace: boolean;
    fx: FixtureManager;

    constructor(scenario: ITestCaseHookParameter, fx: FixtureManager) {
        this.fx = fx;
        this.media = { img: null, videoPath: null };
        let status = scenario.result?.status;
        this.shouldAttachMedia =
            status === Status.PASSED ||
            status === Status.FAILED ||
            status === Status.UNKNOWN;
        this.shouldAttachTrace =
            status !== Status.PENDING &&
            status !== Status.SKIPPED;
    }

    async captureMedia(): Promise<void> {
        let img = await this.fx.page.screenshot({
            path: `./test-results/screenshots/${this.fx.ScenarioName}.png`,
            type: "png",
        });
        const videoPath = await this.fx.page.video().path();
        this.media = {
            img: img,
            videoPath: videoPath
        }
    }

    async attachMedia(world: IWorld) {
        await world.attach(this.media.img, "image/png");
        await world.attach(fs.readFileSync(this.media.videoPath), "video/webm");
    }

    async attachTrace(world: IWorld) {
        const traceFileURL = `http://localhost:${process.env.REPORT_PORT}/trace/${this.fx.ScenarioName}.zip`;
        const traceURL = `https://trace.playwright.dev/?trace=${traceFileURL}`;
        const traceLink = `<a href="${traceURL}">Open /trace/${this.fx.ScenarioName}</a>`;
        await world.attach(`Trace file: ${traceLink}`, "text/html");
    }
}

After(async function (scenario) {
    const art = new ArtifactManager(scenario, fx);

    if (art.shouldAttachMedia) {
        await art.captureMedia();
    }

    await fx.stopTracing();
    await fx.closePage();
    await fx.closeContext();

    if (art.shouldAttachMedia) {
        await art.attachMedia(this);
    }

    if (art.shouldAttachTrace) {
        await art.attachTrace(this);
    }

    fx.Scenario = null;
});

AfterAll(async function () {
    await fx.closeBrowser();
})


