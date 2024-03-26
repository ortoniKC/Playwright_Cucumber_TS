import * as report from 'multiple-cucumber-html-reporter';
import * as os from 'os';
import * as fs from 'fs-extra';
import { browserDetailsPath } from '../browsers/browserManager';

const browserDetails = fs.existsSync(browserDetailsPath)
    ? fs.readJsonSync(browserDetailsPath)
    : {
        name: 'N/A',
        version: 'N/A'
    };

report.generate({
    jsonDir: "test-results",
    reportPath: "test-results/reports/",
    reportName: "Playwright Automation Report",
    pageTitle: "BookCart App test report",
    displayDuration: false,
    metadata: {
        browser: {
            name: browserDetails.name,
            version: browserDetails.version,
        },
        device: os.hostname(),
        platform: {
            name: os.type(),
            version: os.version(),
        },
    },
    customData: {
        title: "Test Info",
        data: [
            { label: "Project", value: "Book Cart Application" },
            { label: "Release", value: "1.2.3" },
            { label: "Cycle", value: "Smoke-1" }
        ],
    },
});