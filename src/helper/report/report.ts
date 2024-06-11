import * as report from 'multiple-cucumber-html-reporter';
import * as os from 'os';
import * as fs from 'fs-extra';
import { browserDetailsPath } from '../browsers/browserManager';
import * as chalk from 'chalk';

const browserDetails = fs.existsSync(browserDetailsPath)
    ? fs.readJsonSync(browserDetailsPath)
    : {
        name: 'N/A',
        version: 'N/A'
    };

// Converts platform name to report format to display proper OS logo
function translatePlatformName(platform): string {
    switch (platform) {
        case 'darwin':
            return 'osx';
        case 'win32':
            return 'windows';
        default:
            return platform;
    }
}

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
            name: translatePlatformName(os.platform()),
            version: os.release()
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

console.log('All tests have run. To view the report, run the following command: ' + chalk.red('npm run open:report') + '\n');