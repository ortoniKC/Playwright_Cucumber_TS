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

// It will trigger for not auth scenarios
Before({ tags: "not @auth" }, async function ({ pickle }) {
    const scenarioName = formatScenarioName(pickle);
    context = await browser.newContext({
        recordVideo: {
            dir: "test-results/videos",
        },
    });
    await context.tracing.start({
        name: scenarioName,
        title: pickle.name,
        sources: true,
        screenshots: true, snapshots: true
    });
    const page = await context.newPage();
    fixture.page = page;
    fixture.logger = createLogger(options(scenarioName));
});


// It will trigger for auth scenarios
Before({ tags: '@auth' }, async function ({ pickle }) {
    const scenarioName = formatScenarioName(pickle);
    context = await browser.newContext({
        storageState: getStorageState(pickle.name),
        recordVideo: {
            dir: "test-results/videos",
        },
    });
    await context.tracing.start({
        name: scenarioName,
        title: pickle.name,
        sources: true,
        screenshots: true, snapshots: true
    });
    const page = await context.newPage();
    fixture.page = page;
    fixture.logger = createLogger(options(scenarioName));
});

After(async function ({ pickle, result }) {
    const scenarioName = formatScenarioName(pickle);
    let videoPath: string;
    let img: Buffer;


    if (
        result?.status === Status.PASSED ||
        result?.status === Status.FAILED ||
        result?.status === Status.UNKNOWN
    ) {
        img = await fixture.page.screenshot(
            { path: `./test-results/screenshots/${scenarioName}.png`, type: "png" }
        );
        videoPath = await fixture.page.video().path();
    }

    const tracePath = path.join(__dirname, '..', '..', 'test-results', 'trace', `${scenarioName}.zip`);
    await context.tracing.stop({ path: tracePath });
    await fixture.page.close();
    await context.close();

    if (
        result?.status === Status.PASSED ||
        result?.status === Status.FAILED ||
        result?.status === Status.UNKNOWN
    ) {
        await this.attach(
            img, "image/png"
        );
        await this.attach(
            fs.readFileSync(videoPath),
            'video/webm'
        );
    }

    if (
        result?.status !== Status.PENDING &&
        result?.status !== Status.SKIPPED
    ) {
        const traceFileURL = `http://localhost:${process.env.REPORT_PORT}/trace/${scenarioName}.zip`;
        const traceURL = `https://trace.playwright.dev/?trace=${traceFileURL}`;
        const traceFileLink = `<a href="${traceURL}">Open /trace/${scenarioName}</a>`;
        await this.attach(`Trace file: ${traceFileLink}`, 'text/html');
    }
});

AfterAll(async function () {
    await browser.close();
})

function getStorageState(user: string): string | { cookies: { name: string; value: string; domain: string; path: string; expires: number; httpOnly: boolean; secure: boolean; sameSite: "Strict" | "Lax" | "None"; }[]; origins: { origin: string; localStorage: { name: string; value: string; }[]; }[]; } {
    if (user.endsWith("admin"))
        return "src/helper/auth/admin.json";
    else if (user.endsWith("lead"))
        return "src/helper/auth/lead.json";
}

function formatScenarioName(pickle) {
    const pickleName = pickle.name.split(' ').join('-'); // Replace spaces with dashes
    return `${pickleName}_${pickle.id}`;
}
