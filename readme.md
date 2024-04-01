# Playwright (TS binding) + Cucumber (BDD)

Cucumber is a popular behavior-driven development (BDD) tool that allows developers and stakeholders to collaborate on defining and testing application requirements in a human-readable format. 
TypeScript is a powerful superset of JavaScript that adds optional static typing, making it easier to catch errors before runtime. By combining these two tools, we can create more reliable and maintainable tests.

## Features

1. Awesome report with screenshots, videos & logs
2. Execute tests on multiple environments 
3. Parallel execution
4. Rerun only failed features
5. Retry failed tests on CI
6. Github Actions integrated with downloadable report
7. Page object model

## Sample report
![image](https://github.com/ortoniKC/Playwright_Cucumber_TS/assets/58769833/da2d9f5a-85e7-4695-8ce2-3378b692afc4)


## Project structure

- .github -> yml file to execute the tests in GitHub Actions
- src -> Contains all the features & Typescript code
- test-results -> Contains all the reports related file

## Reports

1. [Mutilple Cucumber Report](https://github.com/WasiqB/multiple-cucumber-html-reporter)
2. Default Cucumber report
3. [Logs](https://www.npmjs.com/package/winston)
4. Screenshots of failure
5. Test videos of failure
6. Trace of failure

## Get Started

### Setup:

1. Clone or download the project
2. Extract and open in the VS-Code
3. `npm i` to install the dependencies
4. `npx playwright install` to install the browsers
5. `npm run test` to execute the tests
6. To run a particular test change  
```
  paths: [
            "src/test/features/featurename.feature"
         ] 
```
7. Use tags to run a specific or collection of specs
```
npm run test --tags="@test or @add"
```
8. Run on a specific browser
```
npm run test --browser="firefox"
```

### Folder structure
0. `src\pages` -> All the page (UI screen)
1. `src\test\features` -> write your features here
2. `src\test\steps` -> Your step definitions goes here
3. `src\hooks\hooks.ts` -> Browser setup and teardown logic
4. `src\hooks\pageFixture.ts` -> Simple way to share the page objects to steps
5. `src\helper\env` -> Multiple environments are handled
6. `src\helper\types` -> To get environment code suggestions
7. `src\helper\report` -> To generate the report
8. `config/cucumber.js` -> One file to do all the magic
9. `package.json` -> Contains all the dependencies
10. `src\helper\auth` -> Storage state (Auth file)
11. `src\helper\util` -> Read test data from json & logger

## Tutorials
1. Learn Playwright - [Playwright - TS](https://youtube.com/playlist?list=PL699Xf-_ilW7EyC6lMuU4jelKemmS6KgD)
2. BDD in detail - [TS binding](https://youtube.com/playlist?list=PL699Xf-_ilW6KgK-S1l9ynOnBGiZl2Bsk)

## Test Statuses and Reporting
Initially, the code was set to capture screenshots, videos, and trace files only for scenarios with `result.status === 'PASSED'`. However, to provide more comprehensive reporting capabilities, the code has been updated to handle various Cucumber statuses and capture the appropriate test artifacts accordingly.

### Cucumber Statuses
Cucumber provides several statuses that indicate the outcome of a scenario or step during test execution. Here's a brief overview of each status:

1. PASSED:
  - Meaning: The scenario or step has executed successfully without any failures.
  - Test Execution: The test runs to completion.
2. FAILED:
  - Meaning: The scenario or step has encountered a failure during execution. This could be due to an assertion failure, exception, or an explicit failure step.
  - Test Execution: The test runs but encounters a failure.
3. PENDING:
  - Meaning: The scenario or step has a pending implementation. It indicates that the step definition for the corresponding step is missing or not yet implemented.
  - Test Execution: The test does not run for the pending steps.
4. SKIPPED:
  - Meaning: The scenario or step has been skipped explicitly using tags or annotations. It is intentionally not executed.
  Test Execution: The test does not run for the skipped scenarios or steps.
5. UNDEFINED:
  - Meaning: The scenario or step does not have a corresponding step definition. It indicates that the step implementation is missing.
  - Test Execution: The test does not run for the undefined steps.
6. AMBIGUOUS:
  - Meaning: There are multiple step definitions that match a given step in a scenario. Cucumber cannot determine which step definition to execute.
  - Test Execution: The test execution is halted when an ambiguous step is encountered.
7. UNKNOWN:
  - Meaning: This status is used when Cucumber encounters an unknown or unexpected situation during test execution.
  - Test Execution: The behavior may vary depending on the specific circumstances that led to the UNKNOWN status.

### Policy for capturing screenshots, videos, trace files
Based on the Cucumber statuses, the following policy has been implemented for capturing screenshots, videos, and trace files:

- PASSED and FAILED: Capture screenshots, videos, and trace files.
- UNKNOWN: Capture screenshots, videos, and trace files to aid in investigating the unexpected situation.
- PENDING and SKIPPED: Skip capturing screenshots, videos, and trace files.
- UNDEFINED and AMBIGUOUS: Skip capturing screenshots and videos, but capture trace files for debugging purposes.


Feel free to modify this behaviour in `hooks.ts` as per your project needs