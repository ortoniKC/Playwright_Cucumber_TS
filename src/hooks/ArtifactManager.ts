import { IWorld, Status } from "@cucumber/cucumber";
import FixtureManager from "./FixtureManager";
import * as fs from 'fs-extra';

export default class ArtifactManager {
    shouldAttachMedia: boolean;
    shouldAttachTrace: boolean;
    img: Buffer | null;
    videoPath: string | null;

    constructor(private world: IWorld, private fx: FixtureManager) {
        this.img = null;
        this.videoPath = null;

        const { scenario } = this.fx
        this.shouldAttachMedia =
            scenario.Status === Status.PASSED ||
            scenario.Status === Status.FAILED ||
            scenario.Status === Status.UNKNOWN;
        this.shouldAttachTrace =
            scenario.Status !== Status.PENDING &&
            scenario.Status !== Status.SKIPPED;
    }

    async takeScreenshot(): Promise<void> {
        const { scenario, pageManager } = this.fx
        const currentPage = pageManager.Page;

        if (scenario.hasTag('@disable:screenshot')) return;
        if (!currentPage) return;
        this.img = await currentPage.screenshot({
            path: `./test-results/screenshots/${this.fx.scenario.DashedName}.png`,
            type: "png",
        });
        this.videoPath = await currentPage.video()?.path();
    }

    async attachMedia() {
        const { scenario } = this.fx

        if (!scenario.hasTag('@disable:screenshot') && this.img) {
            await this.world.attach(this.img, "image/png");
        }
        if (!scenario.hasTag('@disable:video') && this.videoPath) {
            await this.world.attach(fs.createReadStream(this.videoPath), "video/webm");
        }
    }

    async attachLogs(maxLines: number = 100) {
        const { scenario } = this.fx
        const logFilePath = `test-results/logs/${this.fx.scenario.DashedName}/log.log`;

        if (scenario.hasTag('@disable:log')) return;
        if (!await fs.pathExists(logFilePath)) return;
        const logContent = await fs.readFile(logFilePath, 'utf-8');
        const logLines = logContent.split('\n');
        const totalLines = logLines.length;

        if (totalLines <= 1) return;
        const displayedLines = Math.min(totalLines, maxLines);
        const truncatedMessage = totalLines > maxLines ? '\n[Log truncated due to excessive length]' : '';
        const displayedLogContent = logLines.slice(0, displayedLines).join('\n');

        const logInfo = `Logs (${displayedLines}/${totalLines} lines):\n${displayedLogContent}${truncatedMessage}`;

        await this.world.attach(logInfo, 'text/plain');
    }

    async attachTrace() {
        const { scenario } = this.fx
        if (scenario.hasTag('@disable:trace')) return;

        const traceFileURL = `http://localhost:${process.env.REPORT_PORT}/trace/${this.fx.scenario.DashedName}.zip`;
        const traceURL = `https://trace.playwright.dev/?trace=${traceFileURL}`;
        const traceLink = `<a href="${traceURL}">Open /trace/${this.fx.scenario.DashedName}</a>`;
        await this.world.attach(`Trace file: ${traceLink}`, "text/html");
    }
}