import { BeforeAll, AfterAll, Before, After, Status } from "@cucumber/cucumber";
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

Before(async function ({ pickle }) {
    const scenarioName = formatScenarioName(pickle);
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

After(async function ({ pickle, result }) {
    const scenarioName = formatScenarioName(pickle);
    const tracePath = path.join(__dirname, `../../test-results/trace/${scenarioName}.zip`);

    let img: Buffer;
    let videoPath: string;

    const shouldCaptureMedia =
        result?.status === Status.PASSED ||
        result?.status === Status.FAILED ||
        result?.status === Status.UNKNOWN;

    if (shouldCaptureMedia) {
        img = await fixture.page.screenshot({
            path: `./test-results/screenshots/${scenarioName}.png`,
            type: "png",
        });
        videoPath = await fixture.page.video().path();
    }

    await context.tracing.stop({ path: tracePath });
    await fixture.page.close();
    await context.close();

    if (shouldCaptureMedia) {
        await this.attach(img, "image/png");
        await this.attach(fs.readFileSync(videoPath), "video/webm");
    }

    const shouldAttachTrace =
        result?.status !== Status.PENDING &&
        result?.status !== Status.SKIPPED;

    if (shouldAttachTrace) {
        const traceFileURL = `http://localhost:${process.env.REPORT_PORT}/trace/${scenarioName}.zip`;
        const traceURL = `https://trace.playwright.dev/?trace=${traceFileURL}`;
        const traceFileLink = `<a href="${traceURL}">Open /trace/${scenarioName}</a>`;
        await this.attach(`Trace file: ${traceFileLink}`, "text/html");
    }
});

AfterAll(async function () {
    await browser.close();
})

function formatScenarioName(pickle) {
    const pickleName = pickle.name.split(' ').join('-'); // Replace spaces with dashes
    return `${pickleName}_${pickle.id}`;
}
