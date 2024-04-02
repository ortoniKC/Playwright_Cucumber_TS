import { BeforeAll, AfterAll, Before, After, Status, World, ITestCaseHookParameter } from "@cucumber/cucumber";
import { Browser, BrowserContext } from "@playwright/test";
import { fixture } from "./pageFixture";
import { invokeBrowser } from "../helper/browsers/browserManager";
import { getEnv } from "../helper/env/env";
import { createLogger } from "winston";
import { options } from "../helper/util/logger";
import * as fs from 'fs-extra';
import * as path from 'path';

let browser: Browser;
let context: BrowserContext;

BeforeAll(async function () {
    getEnv();
    browser = await invokeBrowser();
});

Before(async function (scenario) {
    const { pickle } = scenario
    const scenarioName = ArtifactManager.formatScenarioName(scenario);
    const hasAuth = pickle.tags.find((tag) => tag.name === '@auth');

    context = await browser.newContext({
        storageState: hasAuth ? getStorageState(pickle.name) : undefined,
        recordVideo: {
            dir: "test-results/videos",
        }
    });

    await context.tracing.start({
        name: scenarioName,
        title: pickle.name,
        sources: true,
        screenshots: true,
        snapshots: true
    });

    const page = await context.newPage();
    fixture.page = page;
    fixture.logger = createLogger(options(scenarioName));

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
});

type Media = {
    img: Buffer | null;
    videoPath: string | null;
};

class ArtifactManager {
    scenarioName: string;
    media: Media;
    shouldAttachMedia: boolean;
    shouldAttachTrace: boolean;

    static formatScenarioName(scenario: ITestCaseHookParameter) {
        const pickleName = scenario.pickle.name.split(' ').join('-'); // Replace spaces with dashes
        return `${pickleName}_${scenario.pickle.id}`;
    }

    constructor(scenario: ITestCaseHookParameter) {
        this.scenarioName = ArtifactManager.formatScenarioName(scenario);
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

    async captureMedia(): Promise<Media> {
        let img = await fixture.page.screenshot({
            path: `./test-results/screenshots/${this.scenarioName}.png`,
            type: "png",
        });
        const videoPath = await fixture.page.video().path();
        this.media = {
            img: img,
            videoPath: videoPath
        }
        return this.media;
    }

    async attachMedia(world: World) {
        await world.attach(this.media.img, "image/png");
        await world.attach(fs.readFileSync(this.media.videoPath), "video/webm");
    }

    async attachTrace(world: World) {
        const traceFileURL = `http://localhost:${process.env.REPORT_PORT}/trace/${this.scenarioName}.zip`;
        const traceURL = `https://trace.playwright.dev/?trace=${traceFileURL}`;
        const traceLink = `<a href="${traceURL}">Open /trace/${this.scenarioName}</a>`;
        await world.attach(`Trace file: ${traceLink}`, "text/html");
    }
}

After(async function (scenario) {
    const manager = new ArtifactManager(scenario);

    if (manager.shouldAttachMedia) {
        await manager.captureMedia();
    }

    const tracePath = path.join(__dirname, `../../test-results/trace/${this.scenarioName}.zip`);
    await context.tracing.stop({ path: tracePath });
    await fixture.page.close();
    await context.close();

    if (manager.shouldAttachMedia) {
        await manager.attachMedia(this);
    }

    if (manager.shouldAttachTrace) {
        await manager.attachTrace(this);
    }
});

AfterAll(async function () {
    await browser.close();
})


