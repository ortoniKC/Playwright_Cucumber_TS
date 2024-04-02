import { IWorld, Status } from "@cucumber/cucumber";
import FixtureManager from "./FixtureManager";
import * as fs from 'fs-extra';

type Media = {
    img: Buffer | null;
    videoPath: string | null;
};

export default class ArtifactManager {
    media: Media;
    shouldAttachMedia: boolean;
    shouldAttachTrace: boolean;
    fx: FixtureManager;

    constructor(fx: FixtureManager) {
        this.fx = fx;
        this.media = { img: null, videoPath: null };
        let status = fx.Scenario.result?.status;
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