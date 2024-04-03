import { BeforeAll, AfterAll, Before, After } from "@cucumber/cucumber";
import { getEnv } from "../helper/env/env";
import PlaywrightWorld from "../test/worlds/PlaywrightWorld";
import FixtureManager from "./FixtureManager";
import ArtifactManager from "./ArtifactManager";

let fx: FixtureManager

BeforeAll(async function () {
    getEnv();
    fx = new FixtureManager();
    await fx.openBrowser();
});

Before(async function (this: PlaywrightWorld, scenario) {
    fx.setScenario(scenario);

    await fx.openContext();
    await fx.startTracing();
    if (!fx.scenario.hasTag("@pageless")) {
        await fx.newPage();
    }
    await fx.createLogger();

    this.fixture = fx.Fixture;
});

After(async function (this: PlaywrightWorld, scenario) {
    fx.setScenario(scenario);
    const art = new ArtifactManager(this, fx);

    if (art.shouldAttachMedia) await art.takeScreenshot();

    await fx.stopTracing();
    await fx.closeAllPages();
    await fx.closeContext();

    if (art.shouldAttachMedia) await art.attachMedia();
    if (art.shouldAttachTrace) await art.attachTrace();
    await art.attachLogs();

    fx.clearScenario();
});

AfterAll(async function () {
    await fx.closeBrowser();
})
