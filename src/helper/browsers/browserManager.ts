import { LaunchOptions, chromium, firefox, webkit } from "@playwright/test";
import * as fs from 'fs-extra';

export const browserDetailsPath = 'browser-details.json';


const options: LaunchOptions = {
    headless: !true
}

function launchBrowser(browserType) {
    switch (browserType) {
        case "chrome":
            return chromium.launch(options);
        case "firefox":
            return firefox.launch(options);
        case "webkit":
            return webkit.launch(options);
        default:
            throw new Error("Please set the proper browser!")
    }
}

export async function invokeBrowser() {
    const browserType = process.env.npm_config_browser || "chrome";
    let browser = await launchBrowser(browserType)
    let browserDetails = {
        name: browserType,
        version: browser.version()
    }

    await fs.writeJson(browserDetailsPath, browserDetails);
    return browser
}